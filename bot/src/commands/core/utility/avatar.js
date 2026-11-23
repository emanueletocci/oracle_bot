import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("Mostra l'avatar di un utente")
		.addUserOption((option) =>
			option.setName("target").setDescription("Utente (default: tu)"),
		),

	async execute(interaction, { theme }) {
		const user = interaction.options.getUser("target") ?? interaction.user;

		const embed = new EmbedBuilder()
			.setTitle(theme.t("avatar.title", { user: user.username }))
			.setColor(theme.color)
			.setImage(user.displayAvatarURL({ size: 1024 }));

		await interaction.reply({ embeds: [embed] });
	},
};
