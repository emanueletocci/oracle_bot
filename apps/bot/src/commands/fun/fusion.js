import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import tarotDeck from '../../utils/tarotDeck.js';
import colors from '../../utils/colors.js';

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
        const user1 = interaction.options.getUser('material1');
        const user2 = interaction.options.getUser('material2');

        // Self-fusion check
        if (user1.id === user2.id) {
            return interaction.reply({ 
                content: "🚫 Igor ti guarda perplesso: serve un *secondo* sacrificio per il rituale.", 
                ephemeral: true 
            });
        }

        // --- Error Fusion 15% ---
        const isAccident = Math.random() < 0.15; 

        // --- Name Generation---
        let fusedName;
        let finalColor;
        let flavorText;
        let arcanaInfo;
        let stats;
        let level;

        if (isAccident) {
            fusedName = "Slime (Errore...)";
            finalColor = colors.shadow_purple; 
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

            // Arcano generico per l'errore
            arcanaInfo = { emoji: "💀", name: "Il Carro" };

        } else {            
            // Name fusion (Half of name1 + Half of name2)
            const part1 = user1.username.substring(0, Math.ceil(user1.username.length / 2));
            const part2 = user2.username.substring(Math.ceil(user2.username.length / 2));
            fusedName = `${part1}${part2}`;

            finalColor = colors.velvet_blue; 
            level = Math.floor(Math.random() * 90) + 10; 
            
            // Successful fusion phrases
            const successMessages = [
                "La fusione è riuscita alla perfezione!",
                "Un potere incredibile scorre in questa nuova maschera.",
                "Igor sorride compiaciuto...",
                "Le catene sono state spezzate."
            ];
            flavorText = successMessages[Math.floor(Math.random() * successMessages.length)];

            // Good Stats
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

        // --- EMBED CREATION ---
        const statsString = `💪 St: \`${stats.st}\`  ✨ Ma: \`${stats.ma}\`  🛡️ En: \`${stats.en}\`\n💨 Ag: \`${stats.ag}\`  🍀 Lu: \`${stats.lu}\``;

        const embed = new EmbedBuilder()
            .setTitle(isAccident ? "⚠️ FUSION ACCIDENT" : "⛓️ Velvet Room Execution")
            .setColor(finalColor)
            .setDescription(`*Il rituale della doppia ghigliottina ha inizio...*`)
            .addFields(
                { name: '🧪 Sacrificio A', value: `\`${user1.username}\``, inline: true },
                { name: '🧪 Sacrificio B', value: `\`${user2.username}\``, inline: true },
                
                // Visual divider (invisible but spacious)
                { name: '\u200B', value: '⬇️ **RESULT**', inline: false },
                
                // The New Persona
                { name: `🎭 ${fusedName}`, value: `Lv. **${level}** — ${arcanaInfo.emoji} *${arcanaInfo.name}*`, inline: false },
                
                // The Statistics
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