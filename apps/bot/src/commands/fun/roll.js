import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lancia i dadi.')
        // Option 1: Number of faces (e.g., d6, d20, d100...)
        .addIntegerOption(option =>
            option.setName('facce')
                .setDescription('Numero di facce del dado (default: 6)')
                .setMinValue(2) // A die must have at least 2 faces
                .setMaxValue(100) // Optional limit to prevent huge numbers
        )
        // Amount of dice to roll 
        .addIntegerOption(option =>
            option.setName('quantita')
                .setDescription('Numero di dadi da lanciare (default: 1)')
                .setMinValue(1)
                .setMaxValue(10) // Cap at 10 to prevent chat spam
        ),

    async execute(interaction) {
        // Retrieve input values. If null, use defaults (6 faces, 1 die).
        const faces = interaction.options.getInteger('facce') || 6;
        const amount = interaction.options.getInteger('quantita') || 1;

        // Arrays to store individual results and the sum total
        let results = [];
        let total = 0;

        // Loop 'amount' times to simulate rolling multiple dice
        for (let i = 0; i < amount; i++) {
            // Math logic: Generates a random integer between 1 and 'faces'
            const roll = Math.floor(Math.random() * faces) + 1;
            results.push(roll);
            total += roll;
        }

        // Construct the response string
        let responseMessage = `🎲 **${total}**`;

        // If multiple dice were rolled, append individual results for clarity
        // Example output: "🎲 15 (Risultati: 5, 4, 6)"
        if (amount > 1) {
            responseMessage += ` (Risultati: ${results.join(', ')})`;
        }

        // Special flair for single d20 rolls (D&D style criticals)
        if (faces === 20 && amount === 1) {
            if (total === 20) responseMessage += " 🔥 **CRITICO!** 🔥";
            if (total === 1) responseMessage += " 💀 **FALLIMENTO CRITICO!**";
        }

        // Send the reply to the channel
        await interaction.reply({
            content: `Hai lanciato **${amount}d${faces}**:\n${responseMessage}`
        });
    },
};