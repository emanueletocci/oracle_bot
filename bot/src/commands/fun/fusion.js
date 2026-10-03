import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import tarotDeck from '../../data/tarotDeck.js';
import colors from '../../data/colors.js';
import logger from '../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('fusion')
        .setDescription('Esegui una fusione nella Velvet Room usando due utenti come materiali.')
        .addUserOption(option =>
            option.setName('material1')
                .setDescription('Il primo sacrificio')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('material2')
                .setDescription('Il secondo sacrificio')
                .setRequired(true)),

    async execute(interaction) {
        const firstUser = interaction.options.getUser('material1');
        const secondUser = interaction.options.getUser('material2');

        // Prevent self-fusion
        if (firstUser.id === secondUser.id) {
            logger.warn(`Fusion command rejected because the same user was provided twice. userId=${firstUser.id}`);
            return interaction.reply({
                content: "🚫 Igor ti guarda perplesso: serve un *secondo* sacrificio per il rituale.",
                flags: MessageFlags.Ephemeral,
            });
        }

        // Fusion accident chance: 15%
        const isAccident = Math.random() < 0.15;

        // Result generation
        let fusedName;
        let embedColor;
        let flavorText;
        let arcanaInfo;
        let stats;
        let level;

        if (isAccident) {
            fusedName = "Slime (Errore...)";
            embedColor = colors.shadow_purple;
            flavorText = "⚠️ ALLARME: La ghigliottina si è inceppata! Il risultato è instabile.";
            level = 1;

            // Low stats
            stats = {
                st: Math.floor(Math.random() * 5) + 1,
                ma: Math.floor(Math.random() * 5) + 1,
                en: Math.floor(Math.random() * 5) + 1,
                ag: Math.floor(Math.random() * 5) + 1,
                lu: Math.floor(Math.random() * 50) + 1
            };

            // Generic arcana for fusion accidents
            arcanaInfo = { emoji: "💀", name: "Il Carro" };
        } else {
            // Name fusion (half of name1 + half of name2)
            const firstNamePart = firstUser.username.substring(0, Math.ceil(firstUser.username.length / 2));
            const secondNamePart = secondUser.username.substring(Math.ceil(secondUser.username.length / 2));
            fusedName = `${firstNamePart}${secondNamePart}`;

            embedColor = colors.velvet_blue;
            level = Math.floor(Math.random() * 90) + 10;

            // Successful fusion phrases
            const successMessages = [
                "La fusione è riuscita alla perfezione!",
                "Un potere incredibile scorre in questa nuova maschera.",
                "Igor sorride compiaciuto...",
                "Le catene sono state spezzate."
            ];
            flavorText = successMessages[Math.floor(Math.random() * successMessages.length)];

            // Good stats
            stats = {
                st: Math.floor(Math.random() * 89) + 10,
                ma: Math.floor(Math.random() * 89) + 10,
                en: Math.floor(Math.random() * 89) + 10,
                ag: Math.floor(Math.random() * 89) + 10,
                lu: Math.floor(Math.random() * 89) + 10
            };

            // Pick a random tarot card for the arcana
            const randomCard = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
            arcanaInfo = {
                emoji: randomCard.char ? randomCard.char.emoji : "🃏",
                name: randomCard.char ? randomCard.char.arcana : "Unknown"
            };
        }

        // Embed creation
        const statsString = `💪 St: \`${stats.st}\`  ✨ Ma: \`${stats.ma}\`  🛡️ En: \`${stats.en}\`\n💨 Ag: \`${stats.ag}\`  🍀 Lu: \`${stats.lu}\``;

        const embed = new EmbedBuilder()
            .setTitle(isAccident ? "⚠️ FUSION ACCIDENT" : "⛓️ Velvet Room Execution")
            .setColor(embedColor)
            .setDescription(`*Il rituale della doppia ghigliottina ha inizio...*`)
            .addFields(
                { name: '🧪 Sacrificio A', value: `\`${firstUser.username}\``, inline: true },
                { name: '🧪 Sacrificio B', value: `\`${secondUser.username}\``, inline: true },
                { name: '\u200B', value: '⬇️ **RESULT**', inline: false },
                { name: `🎭 ${fusedName}`, value: `Lv. **${level}** — ${arcanaInfo.emoji} *${arcanaInfo.name}*`, inline: false },
                { name: '📊 Caratteristiche', value: statsString, inline: false }
            )
            .setFooter({
                text: flavorText,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};