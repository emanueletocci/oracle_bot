import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("banner")
		.setDescription("Mostra il banner di un utente")
		.addUserOption((option) =>
			option.setName("target").setDescription("Utente (default: tu)"),
		),

	async execute(interaction, { theme }) {
		const target = interaction.options.getUser("target") ?? interaction.user;
		const user = await target.fetch();
		const bannerUrl = user.bannerURL({ size: 1024 });

		if (!bannerUrl) {
			return interaction.reply({
				content: theme.t("banner.none"),
				flags: MessageFlags.Ephemeral,
			});
		}

		const embed = new EmbedBuilder()
			.setTitle(theme.t("banner.title", { user: user.username }))
			.setColor(theme.color)
			.setImage(bannerUrl);

		await interaction.reply({ embeds: [embed] });
	},
};
