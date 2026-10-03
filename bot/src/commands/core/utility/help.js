import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Lista tutti i comandi disponibili"),

	async execute(interaction, { theme }) {
		const isAvailable = (cmd) => {
			if (cmd.enabled === false) return false;
			if (cmd.module === "dev") return false;
			if (cmd.module === "persona") return theme.name === "persona";
			return true;
		};

		const fields = [...interaction.client.commands.values()]
			.filter(isAvailable)
			.sort((a, b) => a.data.name.localeCompare(b.data.name))
			.map((cmd) => ({
				name: `/${cmd.data.name}`,
				value: cmd.data.description || theme.t("help.noDescription"),
				inline: false,
			}));

		const embed = new EmbedBuilder()
			.setTitle(theme.t("help.title"))
			.setColor(theme.color)
			.setDescription(theme.t("help.description"))
			.addFields(fields);

		await interaction.reply({ embeds: [embed] });
	},
};
