import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, MessageFlags } from "discord.js";
import fs from "node:fs";
import logger from "#utils/logger.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ship")
		.setDescription("Valuta l'affinità tra due persone 💞")
		.addUserOption((option) =>
			option.setName("utente1").setDescription("La prima persona").setRequired(true),
		)
		.addUserOption((option) =>
			option.setName("utente2").setDescription("La seconda persona (default: tu)").setRequired(false),
		),

	async execute(interaction, { theme }) {
		// --- USER MANAGEMENT ---
		let user1 = interaction.options.getUser("utente1");
		let user2 = interaction.options.getUser("utente2");

		// If user2 is missing, use the command invoker as the second user
		if (!user2) {
			user2 = user1;
			user1 = interaction.user;
		}

		// --- EARLY REJECTION CHECKS ---
		if (user1.id === user2.id) {
			logger.warn(`Ship command rejected due to self-ship. userId=${user1.id}`);
			return interaction.reply({
				content: theme.t("ship.selfShip", { user: user1 }),
				flags: MessageFlags.Ephemeral,
			});
		}

		const botId = interaction.client.user.id;
		if (user1.id === botId || user2.id === botId) {
			logger.info(`Ship command invoked with bot user. userId=${interaction.user.id}`);
			return interaction.reply(theme.t("ship.botShip", { bot: interaction.client.user }));
		}

		// --- RESULT ---
		const percent = Math.floor(Math.random() * 101);
		const rank = Math.round(percent / 10);
		const visualBar = "⭐".repeat(rank) + "▪️".repeat(10 - rank);
		const outcome = theme.t("ship.outcome", { percent });

		// --- EMBED CREATION ---
		const fields = [];
		if (outcome.arcana) {
			fields.push({
				name: theme.t("ship.arcanaLabel"),
				value: `${outcome.emoji ?? "🃏"} **${outcome.arcana}**`,
				inline: true,
			});
		}
		fields.push(
			{ name: theme.t("ship.affinityLabel"), value: `📈 **${percent}%**`, inline: true },
			{ name: theme.t("ship.rankLabel"), value: `${visualBar}\n\n${outcome.message}` },
		);

		const embed = new EmbedBuilder()
			.setTitle(theme.t("ship.title"))
			.setDescription(`**${user1}** ❤️ **${user2}**`)
			.addFields(fields)
			.setColor(outcome.color ?? theme.color)
			.setFooter({
				text: theme.t("ship.footer"),
				iconURL: interaction.client.user.displayAvatarURL(),
			});

		const files = [];
		if (outcome.image) {
			if (fs.existsSync(outcome.image)) {
				files.push(new AttachmentBuilder(outcome.image, { name: "ship_result.png" }));
				embed.setThumbnail("attachment://ship_result.png");
			}
			else {
				logger.warn(`Ship image not found: ${outcome.image}`);
			}
		}

		await interaction.reply({ embeds: [embed], files });

		logger.info(
			`Ship command executed successfully. guildId=${interaction.guildId} userId=${interaction.user.id} percent=${percent} theme=${theme.name}`,
		);
	},
};
