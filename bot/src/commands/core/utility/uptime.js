import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { formatUptime } from "#utils/time.js";

export default {
	data: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Mostra da quanto tempo il bot è online"),

	async execute(interaction, { theme }) {
		const embed = new EmbedBuilder()
			.setTitle(theme.t("uptime.title"))
			.setColor(theme.color)
			.setDescription(formatUptime(interaction.client.uptime));

		await interaction.reply({ embeds: [embed] });
	},
};
