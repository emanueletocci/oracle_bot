import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js";
import path from "node:path";
import { randomInt } from "node:crypto";
import colors from "../../data/colors.js";
import logger from "../../utils/logger.js";
import { IMAGES_DIR } from "../../utils/paths.js";

export default {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Sfida la sorte nel Metaverso: Ladri Fantasma o Ombre? 🃏"),

    async execute(interaction) {
        const outcome = randomInt(0, 2);
        const isPhantom = outcome === 0;

        await interaction.reply(
            `😼 ${interaction.user}! Tieni pronto il coltello, percepisco qualcosa...*`,
        );

        let resultTitle;
        let resultDescription;
        let imageName;
        let embedColor;

        if (isPhantom) {
            resultTitle = "🎭 PHANTOM THIEVES WIN! - TESTA";
            resultDescription =
                "**The show's over.**\nIl nemico è stato annientato con stile. Vittoria perfetta.";
            imageName = "coinJoker.png";
            embedColor = colors.p5_red;
        } else {
            resultTitle = "💀 SHADOWS WIN! - CROCE";
            resultDescription =
                "**Senti il rumore di catene...**\nIl Mietitore ti ha trovato. Non c'è via di fuga. *Despair.*";
            imageName = "coinShadow.png";
            embedColor = colors.shadow_purple;
        }

        const imagePath = path.join(IMAGES_DIR, "coins", imageName);

        let attachment;

        try {
            attachment = new AttachmentBuilder(imagePath, { name: imageName });
        } catch (error) {
            logger.error(
                `Failed to create coinflip attachment from path ${imagePath}: ${error.message}`,
            );
            return interaction.editReply(
                "Errore: Non trovo l'immagine della moneta nella cartella assets!",
            );
        }

        const embed = new EmbedBuilder()
            .setTitle(resultTitle)
            .setDescription(resultDescription)
            .setColor(embedColor)
            .setThumbnail(`attachment://${imageName}`);

        await interaction.editReply({
            content: null,
            embeds: [embed],
            files: [attachment],
        });

        logger.info(
            `Coinflip command executed successfully for user ${interaction.user.id} with outcome ${isPhantom ? "phantom" : "shadow"}.`,
        );
    },
};