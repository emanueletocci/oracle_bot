import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { formatUptime } from "#utils/time.js";

export default {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Mostra le statistiche del bot"),

	async execute(interaction, { theme }) {
		const { client } = interaction;
		const guilds = client.guilds.cache.size;
		const users = client.guilds.cache.reduce(
			(acc, guild) => acc + (guild.memberCount ?? 0),
			0,
		);
		const commands = client.commands.size;
		const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

		const embed = new EmbedBuilder()
			.setTitle(theme.t("stats.title"))
			.setColor(theme.color)
			.addFields(
				{ name: theme.t("stats.guildsLabel"), value: `${guilds}`, inline: true },
				{ name: theme.t("stats.usersLabel"), value: `${users}`, inline: true },
				{ name: theme.t("stats.commandsLabel"), value: `${commands}`, inline: true },
				{ name: theme.t("stats.uptimeLabel"), value: formatUptime(client.uptime), inline: true },
				{ name: theme.t("stats.memoryLabel"), value: `${memory} MB`, inline: true },
			);

		await interaction.reply({ embeds: [embed] });
	},
};
