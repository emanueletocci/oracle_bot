import { SlashCommandBuilder, MessageFlags } from "discord.js";
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	NoSubscriberBehavior,
	getVoiceConnection,
} from "@discordjs/voice";
import fs from "node:fs";
import path from "node:path";
import logger from "#utils/logger.js";
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
			});

			const player = createAudioPlayer({
				behaviors: { noSubscriber: NoSubscriberBehavior.Play },
			});
			connection.subscribe(player);

			const playSong = () => {
				player.play(createAudioResource(LOFI_PATH, { inlineVolume: true }));
			};

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
			const connection = getVoiceConnection(interaction.guild.id);

			if (!connection) {
				return interaction.reply({ content: theme.t("lofi.notConnected"), flags: MessageFlags.Ephemeral });
			}

			connection.destroy();
			return interaction.reply(theme.t("lofi.stopped"));
		}
	},
};
