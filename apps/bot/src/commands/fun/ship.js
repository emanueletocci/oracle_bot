import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, MessageFlags } from "discord.js";
import path from "node:path";
import chars from "../../data/characters.js";
import colors from "../../data/colors.js";
import logger from "../../utils/logger.js";
import { CHARACTERS_DIR } from "../../utils/paths.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ship")
        .setDescription("Valuta il legame sociale tra due persone 🎭")
        .addUserOption((option) =>
            option.setName("utente1").setDescription("Il primo confidente").setRequired(true)
        )
        .addUserOption((option) =>
            option.setName("utente2").setDescription("Il secondo confidente").setRequired(false)
        ),

    async execute(interaction) {
        // --- USER MANAGEMENT ---
        let user1 = interaction.options.getUser("utente1");
        let user2 = interaction.options.getUser("utente2");

        // If user2 is missing, use the command invoker as the second user
        if (!user2) {
            user2 = user1;
            user1 = interaction.user;
        }

        // --- EARLY REJECTION CHECKS ---

        // 1. Self-Ship check
        if (user1.id === user2.id) {
            logger.warn(`Ship command rejected due to self-ship. userId=${user1.id}`);
            return interaction.reply({
                content: `😼 Ehi ${user1}! Smettila di guardarti allo specchio! (Narcisismo: 100%)`,
                flags: MessageFlags.Ephemeral,
            });
        }

        // 2. Bot-Ship check
        if (user1.id === interaction.client.user.id || user2.id === interaction.client.user.id) {
            logger.info(`Ship command invoked with bot user. userId=${interaction.user.id}`);
            return interaction.reply(
                `😼 Ehi ${interaction.client.user}! Niente distrazioni, devi andare a dormire!`
            );
        }

        // --- PERCENTAGE CALCULATION ---
        const lovePercent = Math.floor(Math.random() * 101);

        // --- RANK CALCULATION (Star Bar) ---
        const rank = Math.round(lovePercent / 10);
        const visualBar = "⭐".repeat(rank) + "▪️".repeat(10 - rank);

        // --- CHARACTER SELECTION (CORE LOGIC) ---
        // Decide which character object to use based on the percentage.

        let outcome = {};
        let defaultImage = "hat.png";

        if (lovePercent === 0) {
            outcome.char = chars.igor;
            outcome.message = "⚰️ Il vuoto cosmico. Nemmeno Arsène può rubare questo cuore, perché non c'è.";
        }
        else if (lovePercent === 69) {
            outcome.char = chars.skull;
            outcome.message = "💀 For real?! Che numero assurdo!";
        }
        else if (lovePercent === 77) {
            outcome.char = chars.chihaya;
            outcome.message = "🔮 **Jackpot!** Le carte prevedono una fortuna sfacciata tra voi due!";
        }
        else if (lovePercent === 99) {
            outcome.specialImage = "callingCard.png";
            outcome.color = colors.p5_red;
            outcome.arcana = "THE JOLLY";
            outcome.message = "🃏 **Take Your Heart!** Manca solo l'1%... serve solo inviare la Lettera di Sfida!";
        }
        else if (lovePercent < 15) {
            outcome.char = chars.takemi;
            outcome.message = "💉 Questa relazione è tossica. Vi serve una visita medica urgente.";
        }
        else if (lovePercent < 35) {
            outcome.char = chars.mona;
            outcome.message = "🐱 Ehi... credo che tu sia nella Friendzone, proprio come me con Lady Ann.";
        }
        else if (lovePercent < 55) {
            outcome.char = chars.crow;
            outcome.message = "⚖️ Vi odiate o vi amate? C'è una strana tensione... una rivalità mortale.";
        }
        else if (lovePercent < 70) {
            outcome.char = chars.ohya;
            outcome.message = "🍸 È una relazione complicata e adulta. Forse dovreste parlarne davanti a un drink.";
        }
        else if (lovePercent < 85) {
            outcome.char = chars.panther;
            outcome.message = "🤝 Un legame indissolubile! Siete pronti per i Memento.";
        }
        else {
            outcome.char = chars.lavenza;
            outcome.message = "🦋 Io sono te, tu sei me... Hai trasformato una promessa in un patto di sangue.";
        }

        // --- FINAL DATA EXTRACTION ---
        const finalImageName = outcome.char ? outcome.char.image : (outcome.specialImage || defaultImage);
        const finalColor = outcome.char ? outcome.char.color : (outcome.color || colors.p5_red);
        const finalArcana = outcome.char ? outcome.char.arcana : (outcome.arcana || "???");
        const finalEmoji = outcome.char ? outcome.char.emoji : "🃏";

        const finalPath = path.join(CHARACTERS_DIR, finalImageName);
        const attachment = new AttachmentBuilder(finalPath, { name: "ship_result.png" });

        // --- EMBED CREATION ---
        const embed = new EmbedBuilder()
            .setTitle(`🎭 CONFIDANT ASSESSMENT`)
            .setDescription(`**${user1}** ❤️ **${user2}**`)
            .addFields(
                { name: "Arcano", value: `${finalEmoji} **${finalArcana}**`, inline: true },
                { name: "Affinità", value: `📈 **${lovePercent}%**`, inline: true },
                { name: "Social Link Rank", value: `${visualBar}\n\n${outcome.message}` }
            )
            .setColor(finalColor)
            .setThumbnail("attachment://ship_result.png")
            .setFooter({
                text: `Take Your Heart ❤️‍🩹`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed], files: [attachment] });

        logger.info(
            `Ship command executed successfully. guildId=${interaction.guildId} userId=${interaction.user.id} percent=${lovePercent} result=${finalArcana}`
        );
    },
};