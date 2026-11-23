import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("roleinfo")
		.setDescription("Mostra informazioni su un ruolo")
		.addRoleOption((option) =>
			option.setName("role").setDescription("Il ruolo").setRequired(true),
		),

	async execute(interaction, { theme }) {
		const role = interaction.options.getRole("role");

		const embed = new EmbedBuilder()
			.setTitle(theme.t("roleinfo.title", { role: role.name }))
			.setColor(role.color || theme.color)
			.addFields(
				{ name: theme.t("roleinfo.colorLabel"), value: role.hexColor, inline: true },
				{ name: theme.t("roleinfo.membersLabel"), value: `${role.members.size}`, inline: true },
				{ name: theme.t("roleinfo.positionLabel"), value: `${role.position}`, inline: true },
				{ name: theme.t("roleinfo.mentionableLabel"), value: role.mentionable ? "✅" : "❌", inline: true },
				{ name: theme.t("roleinfo.hoistedLabel"), value: role.hoist ? "✅" : "❌", inline: true },
				{
					name: theme.t("roleinfo.createdLabel"),
					value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`,
					inline: true,
				},
				{ name: theme.t("roleinfo.idLabel"), value: role.id, inline: false },
			);

		await interaction.reply({ embeds: [embed] });
	},
};
