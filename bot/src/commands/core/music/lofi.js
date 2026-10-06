import { SlashCommandBuilder, MessageFlags } from "discord.js";
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	NoSubscriberBehavior,
	VoiceConnectionStatus,
	entersState,
	getVoiceConnection,
} from "@discordjs/voice";
import fs from "node:fs";
import path from "node:path";
import logger from "#utils/logger.js";
import { isMusicActive } from "#utils/audioState.js";
import { MUSIC_DIR } from "#utils/paths.js";

const LOFI_PATH = path.join(MUSIC_DIR, "lofi.mp3");

export default {
	data: new SlashCommandBuilder()
		.setName("lofi")
		.setDescription("Gestione della radio Lofi")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("play")
				.setDescription("Avvia la radio lofi H24 nel canale audio"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("stop")
				.setDescription("Ferma la radio e disconnette il bot"),
		),

	async execute(interaction, { theme }) {
		const subcommand = interaction.options.getSubcommand();

		// --- PLAY LOGIC ---
		if (subcommand === "play") {
			const channel = interaction.member.voice.channel;

			if (!channel) {
				return interaction.reply({ content: theme.t("lofi.notInVoice"), flags: MessageFlags.Ephemeral });
			}

			// Music is using the voice connection: block the command
			if (isMusicActive(interaction.guild)) {
				return interaction.reply({ content: theme.t("lofi.musicActive"), flags: MessageFlags.Ephemeral });
			}

			if (getVoiceConnection(interaction.guild.id)) {
				return interaction.reply({ content: theme.t("lofi.alreadyPlaying"), flags: MessageFlags.Ephemeral });
			}

			if (!fs.existsSync(LOFI_PATH)) {
				logger.error(`Lofi file not found: ${LOFI_PATH}`);
				return interaction.reply({ content: theme.t("lofi.fileMissing"), flags: MessageFlags.Ephemeral });
			}

			await interaction.reply(theme.t("lofi.started", { member: interaction.member }));

			const connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
				debug: true, // TEMP DEBUG
			});

			const player = createAudioPlayer({
				behaviors: { noSubscriber: NoSubscriberBehavior.Play },
			});
			connection.subscribe(player);

			// TEMP DEBUG: remove once the audio issue is solved
			connection.on("stateChange", (oldState, newState) =>
				logger.info(`[voice] connection: ${oldState.status} -> ${newState.status}`));
			player.on("stateChange", (oldState, newState) =>
				logger.info(`[voice] player: ${oldState.status} -> ${newState.status}`));
			connection.on("debug", (message) => logger.info(`[voice-debug] ${message}`));
			player.on("debug", (message) => logger.info(`[player-debug] ${message}`));

			// When the connection is destroyed (/lofi stop, a manual disconnect, or
			// anything else), stop the player too. Otherwise it keeps looping in
			// memory forever, even after the bot has left the channel.
			connection.on(VoiceConnectionStatus.Destroyed, () => {
				player.removeAllListeners(AudioPlayerStatus.Idle);
				player.stop(true);
				logger.info(`Lofi radio stopped in guild ${interaction.guild.id}`);
			});

			// If the connection drops, give it 5 seconds to recover (short network
			// issue, or the bot was moved to another channel). If it doesn't,
			// someone disconnected the bot on purpose: clean everything up.
			connection.on(VoiceConnectionStatus.Disconnected, async () => {
				try {
					await Promise.race([
						entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
						entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
					]);
				}
				catch {
					if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
						connection.destroy();
					}
				}
			});

			const playSong = () => {
				player.play(createAudioResource(LOFI_PATH, { inlineVolume: true }));
			};

			// Start the music only once the voice connection is really ready
			try {
				await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
			}
			catch {
				logger.error(`Lofi: voice connection not ready after 20s in guild ${interaction.guild.id}`);
				if (connection.state.status !== VoiceConnectionStatus.Destroyed) connection.destroy();
				return;
			}

			logger.info(`Lofi radio started in guild ${interaction.guild.id}`);
			playSong();

			// Infinite loop
			player.on(AudioPlayerStatus.Idle, () => {
				logger.debug(`Lofi radio loop restart in guild ${interaction.guild.id}`);
				playSong();
			});

			player.on("error", (error) => {
				logger.error(`Lofi player error: ${error.message}`);
			});
		}

		// --- STOP LOGIC ---
		else if (subcommand === "stop") {
			// Don't let /lofi stop shut down the music
			if (isMusicActive(interaction.guild)) {
				return interaction.reply({ content: theme.t("lofi.musicActive"), flags: MessageFlags.Ephemeral });
			}

			const connection = getVoiceConnection(interaction.guild.id);

			if (!connection) {
				return interaction.reply({ content: theme.t("lofi.notConnected"), flags: MessageFlags.Ephemeral });
			}

			connection.destroy();
			return interaction.reply(theme.t("lofi.stopped"));
		}
	},
};