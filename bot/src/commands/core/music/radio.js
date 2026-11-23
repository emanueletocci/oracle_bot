import {
	SlashCommandBuilder,
	MessageFlags,
	PermissionFlagsBits,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	NoSubscriberBehavior,
	VoiceConnectionStatus,
	entersState,
	StreamType,
} from "@discordjs/voice";
import logger from "#utils/logger.js";
import { isMusicActive } from "#utils/audioState.js";
import { RADIO_STATIONS } from "#data/radio.js";
import { searchRadioStations, isConfidentMatch } from "#utils/radioSearch.js";
import { db } from "#database/db.js";

// How long a result list stays valid for the selection buttons.
const CANDIDATES_TTL_MS = 5 * 60_000;
const MAX_RESULTS = 10;

// -----------------------------------------------------------------------------
// PERSISTED (per-guild) STATIONS
// -----------------------------------------------------------------------------
const selectStation = db.prepare(
	"SELECT url FROM guild_radio_stations WHERE guild_id = ? AND name = ?",
);
const selectAll = db.prepare(
	"SELECT name, url FROM guild_radio_stations WHERE guild_id = ?",
);
const upsertStation = db.prepare(`
	INSERT INTO guild_radio_stations (guild_id, name, url)
	VALUES (?, ?, ?)
	ON CONFLICT(guild_id, name) DO UPDATE SET url = excluded.url
`);
const deleteStation = db.prepare(
	"DELETE FROM guild_radio_stations WHERE guild_id = ? AND name = ?",
);

// -----------------------------------------------------------------------------
// VOICE — shared with the button handler in interactionCreateEvent
// -----------------------------------------------------------------------------
// guildId -> { connection, player, stationName }
const radios = new Map();

export function getRadio(guildId) {
	return radios.get(guildId);
}

export async function stopRadio(guildId) {
	const entry = radios.get(guildId);
	if (!entry) return false;
	entry.connection.destroy();
	return true;
}

// Returns { ok: true, stationName } or { ok: false, reason } where reason is a
// key suffix under the `radio.` theme namespace.
export async function startRadio(interaction, station) {
	const channel = interaction.member?.voice?.channel;
	if (!channel) return { ok: false, reason: "notInVoice" };
	if (isMusicActive(interaction.guild)) return { ok: false, reason: "musicActive" };
	if (radios.get(interaction.guildId)) return { ok: false, reason: "alreadyPlaying" };

	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: interaction.guild.id,
		adapterCreator: interaction.guild.voiceAdapterCreator,
	});
	const player = createAudioPlayer({
		behaviors: { noSubscriber: NoSubscriberBehavior.Play },
	});
	connection.subscribe(player);

	connection.on(VoiceConnectionStatus.Destroyed, () => {
		const entry = radios.get(interaction.guildId);
		if (entry && entry.player === player) {
			player.stop(true);
			radios.delete(interaction.guildId);
		}
	});

	try {
		// Hand the HTTP body to ffmpeg as an arbitrary stream: passing the URL
		// string directly would make @discordjs/voice treat it as a local file.
		// The timeout only covers the connection setup: an AbortSignal.timeout
		// on a long-lived radio stream would kill the body after N seconds.
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 15_000);
		let response;
		try {
			response = await fetch(station.url, {
				signal: controller.signal,
				headers: { "User-Agent": "OracleBot/1.0" },
			});
		} finally {
			clearTimeout(timer);
		}

		if (!response.ok || !response.body) {
			throw new Error(`Stream returned HTTP ${response.status}`);
		}
		const resource = createAudioResource(response.body, {
			inputType: StreamType.Arbitrary,
			inlineVolume: true,
		});
		player.play(resource);
	} catch (error) {
		logger.error(
			`Radio stream failed in guild ${interaction.guildId}: ${error.message}`,
		);
		connection.destroy();
		return { ok: false, reason: "streamError" };
	}

	radios.set(interaction.guildId, {
		connection,
		player,
		stationName: station.name,
	});

	player.on("error", (error) => {
		logger.error(`Radio playback error: ${error.message}`);
		connection.destroy();
	});

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
	} catch {
		connection.destroy();
		return { ok: false, reason: "notReady" };
	}

	return { ok: true, stationName: station.name };
}

// -----------------------------------------------------------------------------
// CANDIDATES (per-guild search results waiting for a button click)
// -----------------------------------------------------------------------------
function setCandidates(client, guildId, query, stations) {
	client.__radioCandidates ??= new Map();
	client.__radioCandidates.set(guildId, {
		query,
		stations,
		expiresAt: Date.now() + CANDIDATES_TTL_MS,
	});
}

export function getCandidates(client, guildId) {
	const entry = client.__radioCandidates?.get(guildId);
	if (!entry) return null;
	if (entry.expiresAt <= Date.now()) {
		client.__radioCandidates.delete(guildId);
		return null;
	}
	return entry;
}

export function clearCandidates(client, guildId) {
	client.__radioCandidates?.delete(guildId);
}

// -----------------------------------------------------------------------------
// RESOLUTION
// -----------------------------------------------------------------------------
function findStation(guildId, name) {
	const lower = name.toLowerCase();
	const builtIn = RADIO_STATIONS.find((s) => s.name.toLowerCase() === lower);
	if (builtIn) return { ...builtIn, builtIn: true };

	const row = selectStation.get(guildId, name);
	return row ? { name, url: row.url, builtIn: false } : null;
}

// Resolves a query to a station to play right away, or to a list of choices.
// Order: built-in/saved exact match -> cached results for the same query ->
// worldwide search. A single result, or exactly one clearly matching name,
// plays directly; anything else opens the button picker.
// Exported for the test suite.
export async function resolveQuery(client, guildId, query) {
	const exact = findStation(guildId, query);
	if (exact) return { kind: "direct", station: exact };

	const cached = getCandidates(client, guildId);
	if (cached && cached.query.toLowerCase() === query.toLowerCase()) {
		return toResolution(cached.stations, cached.query);
	}

	const results = (await searchRadioStations(query)).slice(0, MAX_RESULTS);
	if (results.length === 0) return { kind: "none", query };

	setCandidates(client, guildId, query, results);
	return toResolution(results, query);
}

function toResolution(stations, query) {
	if (stations.length === 1) return { kind: "direct", station: stations[0] };

	const confident = stations.filter((s) => isConfidentMatch(query, s.name));
	if (confident.length === 1) return { kind: "direct", station: confident[0] };

	return { kind: "list", query, stations };
}

// -----------------------------------------------------------------------------
// COMMAND
// -----------------------------------------------------------------------------
export default {
	data: new SlashCommandBuilder()
		.setName("radio")
		.setDescription("Gestione delle stazioni radio in streaming (24/7)")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("play")
				.setDescription("Avvia una stazione radio (built-in, salvata o cercata)")
				.addStringOption((option) =>
					option
						.setName("station")
						.setDescription("Nome stazione o parola chiave (es. 'kiss kiss')")
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("stop").setDescription("Ferma la radio"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("list").setDescription("Elenca le stazioni"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("save")
				.setDescription("Salva una stazione radio personalizzata per questo server")
				.addStringOption((option) =>
					option.setName("name").setDescription("Nome della stazione").setRequired(true),
				)
				.addStringOption((option) =>
					option.setName("url").setDescription("URL dello stream diretto").setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Rimuove una stazione salvata")
				.addStringOption((option) =>
					option.setName("name").setDescription("Nome della stazione").setRequired(true),
				),
		),

	async execute(interaction, { theme }) {
		const sub = interaction.options.getSubcommand();

		// --- play: exact match, otherwise worldwide search with a picker ---
		if (sub === "play") {
			const query = interaction.options.getString("station");

			// Fast guards answered before deferring, so they can be ephemeral.
			if (!interaction.member?.voice?.channel) {
				return interaction.reply({
					content: theme.t("radio.notInVoice"),
					flags: MessageFlags.Ephemeral,
				});
			}
			if (isMusicActive(interaction.guild)) {
				return interaction.reply({
					content: theme.t("radio.musicActive"),
					flags: MessageFlags.Ephemeral,
				});
			}
			if (getRadio(interaction.guildId)) {
				return interaction.reply({
					content: theme.t("radio.alreadyPlaying"),
					flags: MessageFlags.Ephemeral,
				});
			}

			// Starting the stream can take several seconds: always defer first.
			await interaction.deferReply();

			const resolved = await resolveQuery(interaction.client, interaction.guildId, query);

			if (resolved.kind === "none") {
				return interaction.editReply(theme.t("radio.searchNoResults", { query }));
			}

			if (resolved.kind === "direct") {
				const result = await startRadio(interaction, resolved.station);
				if (!result.ok) return interaction.editReply(theme.t(`radio.${result.reason}`));
				return interaction.editReply(
					theme.t("radio.started", {
						member: interaction.member,
						station: result.stationName,
					}),
				);
			}

			const lines = resolved.stations
				.map(
					(station, i) =>
						`\`${i + 1}.\` ${theme.t("radio.searchEntry", {
							name: station.name,
							country: station.country,
							bitrate: station.bitrate,
						})}`,
				)
				.join("\n");

			const buttons = resolved.stations.map((station, i) =>
				new ButtonBuilder()
					.setCustomId(`radio_select:${i}`)
					.setLabel(`${i + 1}`)
					.setStyle(ButtonStyle.Secondary),
			);
			const rows = [];
			for (let i = 0; i < buttons.length; i += 5) {
				rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
			}

			const embed = new EmbedBuilder()
				.setTitle(theme.t("radio.searchTitle", { query: resolved.query }))
				.setColor(theme.color)
				.setDescription(lines)
				.setFooter({ text: theme.t("radio.selectFooter") });

			return interaction.editReply({ embeds: [embed], components: rows });
		}

		if (sub === "stop") {
			const stopped = await stopRadio(interaction.guildId);
			if (!stopped) {
				return interaction.reply({
					content: theme.t("radio.listNone"),
					flags: MessageFlags.Ephemeral,
				});
			}
			return interaction.reply(theme.t("radio.stopped"));
		}

		if (sub === "list") {
			const active = getRadio(interaction.guildId);
			const builtInLines = RADIO_STATIONS.map((s) => `• **${s.name}**`).join("\n");
			const savedRows = selectAll.all(interaction.guildId);
			const savedLines = savedRows.length
				? `\n\n**${theme.t("radio.listSavedTitle")}**\n${savedRows
						.map((s) => `• **${s.name}**`)
						.join("\n")}`
				: "";

			const embed = new EmbedBuilder()
				.setTitle(theme.t("radio.listTitle"))
				.setColor(theme.color)
				.setDescription(
					`${
						active
							? `${theme.t("radio.listActive", { station: active.stationName })}\n\n`
							: ""
					}${builtInLines}${savedLines}`,
				)
				.setFooter({ text: theme.t("radio.listFooter") });

			return interaction.reply({ embeds: [embed] });
		}

		// --- save / remove are admin operations ---
		const isAdmin =
			interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ||
			interaction.user.id === interaction.guild.ownerId;
		if (!isAdmin) {
			return interaction.reply({
				content: theme.t("radio.noPermission"),
				flags: MessageFlags.Ephemeral,
			});
		}

		if (sub === "save") {
			const name = interaction.options.getString("name");
			const url = interaction.options.getString("url");
			if (!/^https?:\/\//.test(url)) {
				return interaction.reply({
					content: theme.t("radio.invalidUrl"),
					flags: MessageFlags.Ephemeral,
				});
			}
			upsertStation.run(interaction.guildId, name, url);
			return interaction.reply(theme.t("radio.saved", { station: name }));
		}

		const name = interaction.options.getString("name");
		const result = deleteStation.run(interaction.guildId, name);
		if (result.changes === 0) {
			return interaction.reply({
				content: theme.t("radio.notFound"),
				flags: MessageFlags.Ephemeral,
			});
		}
		return interaction.reply(theme.t("radio.removed", { station: name }));
	},
};
