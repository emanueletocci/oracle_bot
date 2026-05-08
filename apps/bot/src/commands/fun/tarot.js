import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import tarotDeck from '../../data/tarotDeck.js';
import logger from '../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('tarot')
        .setDescription('Chihaya estrae un Arcano e ti rivela il tuo Confidente.'),

    async execute(interaction) {
        // Select a random tarot card from the deck
        const card = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
        const character = card.char;

        // Build the embed response
        const embed = new EmbedBuilder()
            .setColor(character.color)
            .setTitle(`${character.emoji} ${character.arcana} (No. ${card.number})`)
            .setDescription(`*"${card.meaning}"*`)
            .addFields(
                { name: '🎭 Confidente', value: `**${character.name}**`, inline: true },
                { name: '🎴 Arcano', value: character.arcana, inline: true }
            )
            .setFooter({
                text: 'Velvet Room • Destiny Reading',
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        logger.info(
            `Tarot command executed successfully. guildId=${interaction.guildId} userId=${interaction.user.id} cardNumber=${card.number} arcana=${character.arcana} character=${character.name}`
        );
    },
};