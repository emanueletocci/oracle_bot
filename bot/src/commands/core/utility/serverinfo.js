import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("serverinfo")
		.setDescription("Mostra informazioni sul server"),

	async execute(interaction, { theme }) {
		const { guild } = interaction;
		const owner = await guild.fetchOwner();
		const boosts = guild.premiumSubscriptionCount ?? 0;

		const embed = new EmbedBuilder()
			.setTitle(theme.t("serverinfo.title", { name: guild.name }))
			.setColor(theme.color)
			.setThumbnail(guild.iconURL())
			.addFields(
				{ name: theme.t("serverinfo.ownerLabel"), value: `${owner}`, inline: true },
				{ name: theme.t("serverinfo.membersLabel"), value: `${guild.memberCount}`, inline: true },
				{ name: theme.t("serverinfo.boostsLabel"), value: `${boosts}`, inline: true },
				{ name: theme.t("serverinfo.channelsLabel"), value: `${guild.channels.cache.size}`, inline: true },
				{ name: theme.t("serverinfo.rolesLabel"), value: `${guild.roles.cache.size}`, inline: true },
				{
					name: theme.t("serverinfo.createdLabel"),
					value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
					inline: true,
				},
				{ name: theme.t("serverinfo.idLabel"), value: guild.id, inline: false },
			);

		await interaction.reply({ embeds: [embed] });
	},
};
