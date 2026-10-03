import {
	SlashCommandBuilder,
	EmbedBuilder,
	AttachmentBuilder,
	MessageFlags,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import logger from "#utils/logger.js";
import { SLAPS_DIR } from "#utils/paths.js";

export default {
	data: new SlashCommandBuilder()
		.setName("slap")
		.setDescription("Dai uno schiaffo a qualcuno! 👋")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("Chi colpire.")
				.setRequired(true),
		),

	async execute(interaction, { theme }) {
		const sender = interaction.user;
		const target = interaction.options.getUser("target");

		if (sender.id === target.id) {
			logger.warn(`Slap command rejected due to self-attack. userId=${sender.id}`);
			return interaction.reply({ content: theme.t("slap.self"), flags: MessageFlags.Ephemeral });
		}

		if (target.id === interaction.client.user.id) {
			logger.warn(`Slap command attempted to attack the bot. userId=${sender.id}`);
			return interaction.reply({ content: theme.t("slap.bot"), flags: MessageFlags.Ephemeral });
		}

		if (!fs.existsSync(SLAPS_DIR)) {
			logger.error(`Slap command failed because slap folder does not exist: ${SLAPS_DIR}`);
			return interaction.reply({ content: theme.t("slap.missingFolder"), flags: MessageFlags.Ephemeral });
		}

		try {
			const files = fs
				.readdirSync(SLAPS_DIR)
				.filter((file) => file.toLowerCase().endsWith(".gif"));

			if (files.length === 0) {
				logger.warn(`Slap command failed: slaps folder ${SLAPS_DIR} is empty.`);
				return interaction.reply({ content: theme.t("slap.emptyFolder"), flags: MessageFlags.Ephemeral });
			}

			const randomFile = files[Math.floor(Math.random() * files.length)];
			const attachment = new AttachmentBuilder(path.join(SLAPS_DIR, randomFile));

			const embed = new EmbedBuilder()
				.setColor(theme.color)
				.setDescription(theme.t("slap.quote", { sender, target }))
				.setImage(`attachment://${randomFile}`);

			await interaction.reply({
				content: `${target}`,
				embeds: [embed],
				files: [attachment],
			});

			logger.info(
				`Slap command executed successfully. guildId=${interaction.guildId} userId=${sender.id} targetId=${target.id} gif=${randomFile} theme=${theme.name}`,
			);
		}
		catch (error) {
			logger.error(`Slap command failed with error: ${error.message}. stack=${error.stack}`);
			await interaction.reply({ content: theme.t("slap.readError"), flags: MessageFlags.Ephemeral });
		}
	},
};
