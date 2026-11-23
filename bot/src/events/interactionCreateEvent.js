import { Events, MessageFlags, Collection } from "discord.js";
import { randomUUID } from "node:crypto";
import logger from "#utils/logger.js";
import { getGuildTheme } from "#settings/guildSettings.js";
import {
	startRadio,
	getCandidates,
	clearCandidates,
} from "#commands/core/music/radio.js";

const DEFAULT_COOLDOWN_SECONDS = 3;

// Hard cap on how long a command may take. Some failure modes (e.g. a REST
// upload that stalls and never settles) would otherwise leave the user with
// a frozen interaction and no feedback at all: with this race, the normal
// error path below always runs, even if the underlying request never ends.
const COMMAND_TIMEOUT_MS = 60_000;

// Exported for the test suite.
export function withTimeout(promise) {
	let timer;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(
			() => reject(new Error(`Timed out after ${COMMAND_TIMEOUT_MS}ms`)),
			COMMAND_TIMEOUT_MS,
		);
		// `?.` keeps this working under test fake timers, where the id has no unref.
		timer.unref?.();
	});

	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// Handle radio selection buttons. When a /radio play shows a list, the
		// buttons carry a "radio_select:<index>" customId and payload stashed
		// on the client.
		if (interaction.isButton()) {
			const customId = interaction.customId;
			if (customId?.startsWith("radio_select:")) {
				await handleRadioButton(interaction, customId);
				return;
			}
		}

		if (!interaction.isChatInputCommand()) return;

		const { client, commandName } = interaction;
		const command = client.commands.get(commandName);

		if (!command) {
			logger.error(`No command matching ${commandName} was found.`);
			return;
		}

		// ---------------------------------------------------------------------
		// THEME CHECK
		// ---------------------------------------------------------------------

		// Each guild has a theme (persona or neutral). Commands in the
		// "persona" module only exist inside the Persona theme.
		const theme = getGuildTheme(interaction.guildId);

		if (command.module === "persona" && theme.name !== "persona") {
			return interaction.reply({
				content: theme.t("errors.personaOnly"),
				flags: MessageFlags.Ephemeral,
			});
		}

		// ---------------------------------------------------------------------
		// COOLDOWN CHECK
		// ---------------------------------------------------------------------
		const { cooldowns } = client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const cooldownAmount =
			(command.cooldown ?? DEFAULT_COOLDOWN_SECONDS) * 1_000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime =
				timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1_000);
				return interaction.reply({
					content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		// ---------------------------------------------------------------------
		// COMMAND EXECUTION
		// ---------------------------------------------------------------------
		const start = performance.now();
		const ctx = `/${commandName} user=${interaction.user.id} guild=${interaction.guildId}`;

		try {
			await withTimeout(command.execute(interaction, { theme }));
			logger.debug(`${ctx} ok in ${Math.round(performance.now() - start)}ms`);
		} catch (error) {
			// Short code shown to the user and written in the log,
			// so the error can be found quickly when someone reports it.
			const errorId = randomUUID().slice(0, 8);
			const ms = Math.round(performance.now() - start);
			logger.error(`[${errorId}] ${ctx} failed after ${ms}ms`, error);

			const errorMessage = {
				content: `${theme.t("errors.generic")} (code: \`${errorId}\`)`,
				flags: MessageFlags.Ephemeral,
			};

			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp(errorMessage);
				} else {
					await interaction.reply(errorMessage);
				}
			} catch {
				// The interaction has expired: we can't answer anymore,
				// but the error is already in the log.
			}
		}
	},
};

// Handles a radio selection button (customId "radio_select:<index>"). Looks up
// the candidate list stored on the client for this guild and starts playback.
async function handleRadioButton(interaction, customId) {
	const index = Number(customId.slice("radio_select:".length));
	const guildId = interaction.guildId;
	const theme = getGuildTheme(guildId);

	const entry = getCandidates(interaction.client, guildId);
	const station = entry?.stations?.[index];

	await interaction.deferUpdate();

	if (!station) {
		await interaction
			.followUp({
				content: theme.t("radio.selectionExpired"),
				flags: MessageFlags.Ephemeral,
			})
			.catch(() => {});
		return;
	}

	const result = await startRadio(interaction, station);

	if (!result.ok) {
		await interaction
			.followUp({
				content: theme.t(`radio.${result.reason}`),
				flags: MessageFlags.Ephemeral,
			})
			.catch(() => {});
		return;
	}

	// Replace the picker with the confirmation so the buttons cannot be used
	// twice (the radio is already playing in that guild).
	await interaction
		.editReply({
			embeds: [],
			components: [],
			content: theme.t("radio.started", {
				member: interaction.member,
				station: result.stationName,
			}),
		})
		.catch(() => {});

	clearCandidates(interaction.client, guildId);
}
