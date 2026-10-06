import { SlashCommandBuilder, MessageFlags } from "discord.js";
import logger from "#utils/logger.js";
import { isLofiActive } from "#utils/audioState.js";

export default {
	data: new SlashCommandBuilder()
		.setName("music")
		.setDescription("Manage music streaming")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("play")
				.setDescription("Play a song or playlist from external sources")
				.addStringOption((option) =>
					option
						.setName("query")
						.setDescription("Link or name of the song")
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("stop")
				.setDescription("Stop the music and disconnect the bot"),
		),

	async execute(interaction, { theme }) {
		const voiceChannel = interaction.member.voice.channel;

		if (!voiceChannel) {
			return interaction.reply({
				content: theme.t("music.notInVoice"),
				flags: MessageFlags.Ephemeral,
			});
		}

		const subCommand = interaction.options.getSubcommand();
		const { distube } = interaction.client;

		if (subCommand === "play") {
			// The lofi radio is using the voice connection: block the command
			if (isLofiActive(interaction.guild)) {
				return interaction.reply({
					content: theme.t("music.lofiActive"),
					flags: MessageFlags.Ephemeral,
				});
			}

			const query = interaction.options.getString("query");
			await interaction.reply(theme.t("music.loading", { query }));

			try {
				await distube.play(voiceChannel, query, {
					textChannel: interaction.channel,
					member: interaction.member,
				});
				await interaction.editReply(theme.t("music.queued", { query }));
			} catch (error) {
				logger.error(
					`Music play failed for query "${query}": ${error.message}`,
				);
				await interaction.editReply(theme.t("music.notFound"));
			}
		} else if (subCommand === "stop") {
			const queue = distube.getQueue(interaction.guildId);

			if (!queue) {
				// The bot may be in a voice channel even without a queue
				const botVoice = distube.voices.get(interaction.guildId);
				if (botVoice) {
					botVoice.leave();
					return interaction.reply(theme.t("music.leftChannel"));
				}

				return interaction.reply({
					content: theme.t("music.nothingPlaying"),
					flags: MessageFlags.Ephemeral,
				});
			}

			queue.stop();
			distube.voices.leave(interaction.guildId);
			await interaction.reply(theme.t("music.stopped"));
		}
	},
};
