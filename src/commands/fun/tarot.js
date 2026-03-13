import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import tarotDeck from '../../utils/tarotDeck.js'; 

export default {
    data: new SlashCommandBuilder()
        .setName('tarot')
        .setDescription('Chihaya estrae un Arcano e ti rivela il tuo Confidente.'),

    async execute(interaction) {
        const card = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
        const character = card.char; 
        const embed = new EmbedBuilder()
            .setColor(character.color) 
            .setTitle(`${character.emoji} ${character.arcana} (No. ${card.number})`)
            .setDescription(`*"${card.meaning}"*`)
            .addFields(
                { name: '🎭 Confidente', value: `**${character.name}**`, inline: true },
                { name: '🎴 Arcano', value: character.arcana, inline: true }
            )
            .setFooter({ text: 'Velvet Room • Destiny Reading', iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};