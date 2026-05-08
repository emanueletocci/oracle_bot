import { SlashCommandBuilder } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lancia i dadi.')
        // Option 1: Number of faces (e.g., d6, d20, d100...)
        .addIntegerOption(option =>
            option.setName('facce')
                .setDescription('Numero di facce del dado (default: 6)')
                .setMinValue(2)
                .setMaxValue(100)
        )
        // Option 2: Number of dice to roll
        .addIntegerOption(option =>
            option.setName('quantita')
                .setDescription('Numero di dadi da lanciare (default: 1)')
                .setMinValue(1)
                .setMaxValue(10)
        ),

    async execute(interaction) {
        // Retrieve input values and apply defaults if not provided
        const faces = interaction.options.getInteger('facce') || 6;
        const amount = interaction.options.getInteger('quantita') || 1;

        // Store individual roll results and the final total
        const results = [];
        let total = 0;

        // Roll the dice the requested number of times
        for (let i = 0; i < amount; i++) {
            const rollResult = Math.floor(Math.random() * faces) + 1;
            results.push(rollResult);
            total += rollResult;
        }

        // Build the response message
        let responseMessage = `🎲 **${total}**`;

        // Include individual results when rolling multiple dice
        if (amount > 1) {
            responseMessage += ` (Risultati: ${results.join(', ')})`;
        }

        // Add special flair for single d20 critical results
        if (faces === 20 && amount === 1) {
            if (total === 20) responseMessage += " 🔥 **CRITICO!** 🔥";
            if (total === 1) responseMessage += " 💀 **FALLIMENTO CRITICO!**";
        }

        // Send the final response
        await interaction.reply({
            content: `Hai lanciato **${amount}d${faces}**:\n${responseMessage}`
        });

        logger.info(
            `Roll command executed successfully. guildId=${interaction.guildId} userId=${interaction.user.id} faces=${faces} amount=${amount} total=${total}`
        );
    },
};