import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import logger from "#utils/logger.js";

export default {
	data: new SlashCommandBuilder()
		.setName("coinflip")
		.setDescription("Lancia una moneta: testa o croce? 🪙"),

	async execute(interaction, { theme }) {
		const isHeads = randomInt(0, 2) === 0;
		const side = theme.t(isHeads ? "coinflip.heads" : "coinflip.tails");

		// Some themes add a short "suspense" message before the result
		const pending = theme.t("coinflip.pending", { user: interaction.user });
		if (pending) await interaction.reply(pending);

		const embed = new EmbedBuilder()
			.setTitle(side.title)
			.setDescription(side.description)
			.setColor(side.color);

		const files = [];
		if (side.image) {
			if (fs.existsSync(side.image)) {
				const imageName = path.basename(side.image);
				files.push(new AttachmentBuilder(side.image, { name: imageName }));
				embed.setThumbnail(`attachment://${imageName}`);
			}
			else {
				logger.warn(`Coinflip image not found: ${side.image}`);
			}
		}

		const payload = { content: null, embeds: [embed], files };
		if (pending) await interaction.editReply(payload);
		else await interaction.reply(payload);

		logger.info(
			`Coinflip command executed successfully for user ${interaction.user.id} with outcome ${isHeads ? "heads" : "tails"} (theme=${theme.name}).`,
		);
	},
};
