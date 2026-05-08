import {
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
    MessageFlags,
} from "discord.js";
import fs from "fs";
import path from "path";
import colors from '../../data/colors.js';
import logger from '../../utils/logger.js';
import { SLAPS_DIR } from "../../utils/paths.js";

export default {
    data: new SlashCommandBuilder()
        .setName("slap")
        .setDescription("Sferra un attacco in stile Persona! 🎭")
        .addUserOption((option) =>
            option
                .setName("target")
                .setDescription("Il nemico da colpire.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const sender = interaction.user;
        const target = interaction.options.getUser("target");

        if (sender.id === target.id) {
            logger.warn(`Slap command rejected due to self-attack. userId=${sender.id}`);
            return interaction.reply({
                content: "Non puoi attaccarti da solo!",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (target.id === interaction.client.user.id) {
            logger.warn(`Slap command attempted to attack the bot. userId=${sender.id}`);
            return interaction.reply({
                content: "Non puoi colpire me!",
                flags: MessageFlags.Ephemeral,
            });
        }

        const slapsFolder = SLAPS_DIR;

        if (!fs.existsSync(slapsFolder)) {
            logger.error(`Slap command failed because slap folder does not exist: ${slapsFolder}`);
            return interaction.reply({
                content: `❌ **Errore Configurazione:** Non trovo la cartella!\\nAssicurati di aver creato: \`assets/gif/slaps\``,
                flags: MessageFlags.Ephemeral,
            });
        }

        try {
            const files = fs
                .readdirSync(slapsFolder)
                .filter((file) => file.toLowerCase().endsWith(".gif"));

            if (files.length === 0) {
                logger.warn(`Slap command failed: slaps folder ${slapsFolder} is empty.`);
                return interaction.reply({
                    content:
                        "❌ La cartella `assets/gif/slaps` è vuota! Mettici dentro qualche GIF.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            // Pick a random file
            const randomFile = files[Math.floor(Math.random() * files.length)];
            const fullPath = path.join(slapsFolder, randomFile);
            const attachment = new AttachmentBuilder(fullPath);

            const quotes = [
                `**${sender}** e il suo Persona annientano **${target}**! 🎭☠️`,
                `**${sender}** usa una Showtime su **${target}**: *It's showtime!* 🎬💥`,
                `**${sender}** ha scatenato un All-Out Attack su **${target}**! 💨💀`,
                `**${sender}** strappa la maschera a **${target}**: *"Show me your true form!"* 👺🔥`,
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

            const embed = new EmbedBuilder()
                .setColor(colors.p5_red)
                .setDescription(randomQuote)
                .setImage(`attachment://${randomFile}`);

            await interaction.reply({
                content: `${target}`,
                embeds: [embed],
                files: [attachment],
            });

            logger.info(
                `Slap command executed successfully. guildId=${interaction.guildId} userId=${sender.id} targetId=${target.id} gif=${randomFile}`
            );
        } catch (error) {
            logger.error(`Slap command failed with error: ${error.message}. stack=${error.stack}`);
            await interaction.reply({
                content:
                    "Si è verificato un errore critico durante la lettura dei file.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};