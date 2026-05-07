import { fileURLToPath } from "url";
import path from "path";
import { SlashCommandBuilder } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("Manage music streaming")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("play")
                .setDescription("Play a song or playlist from external sources")
                .addStringOption((option) =>
                    option
                        .setName("query")
                        .setDescription("Link or name of the song")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("stop")
                .setDescription("Stop the music and disconnect the bot"),
        ),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content:
                    "🎧 Bzz... Segnale debole, Joker! Non posso trasmettere la traccia se non ti connetti. Infiltrati in un canale vocale!",
                ephemeral: true,
            });
        }

        const subCommand = interaction.options.getSubcommand();

        if (subCommand === "play") {
            const query = interaction.options.getString("query");
            await interaction.reply(`Caricamento in corso per: **${query}**... 🎧`);

            try {
                await interaction.client.distube.play(voiceChannel, query, {
                    textChannel: interaction.channel,
                    member: interaction.member,
                });
                await interaction.editReply(
                    `Rotta calcolata per: **${query}**! Preparazione all'assalto. 🎩`,
                );
            } catch (error) {
                console.error(error);
                await interaction.editReply(
                    "❌ Impossibile trovare la traccia. I server cognitivi fanno resistenza!",
                );
            }
        } else if (subCommand === "stop") {
            const queue = interaction.client.distube.getQueue(interaction.guildId);

            if (!queue) {
                // Check if the bot is in a voice channel even without a queue
                const botVoice = interaction.client.distube.voices.get(interaction.guildId);
                if (botVoice) {
                    botVoice.leave();
                    return interaction.reply("Ritiro strategico! Il bot ha lasciato il canale. 💨");
                }
                
                return interaction.reply({
                    content: "Non c'è nessuna missione in corso in questo momento!",
                    ephemeral: true,
                });
            }

            queue.stop();
            interaction.client.distube.voices.leave(interaction.guildId);

            await interaction.reply(
                "Missione annullata. Ritiro strategico dal canale vocale! Il bot è tornato al Leblanc. 💨",
            );
        }
    },
};