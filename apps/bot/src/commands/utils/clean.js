import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    // 1. Command Definition
    data: new SlashCommandBuilder()
        .setName('clean')
        .setDescription('Cancella una quantità specifica di messaggi.')
        // Add the "amount" option (optional)
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Il numero di messaggi da cancellare (max 100).')
                .setRequired(false) // Not mandatory
        )
        // Security permission: Only Administrators can use this command
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // 2. Execution
    async execute(interaction) {
        // Retrieve the number input by the user.
        // If nothing is entered, inputAmount will be null.
        const inputAmount = interaction.options.getInteger('amount');

        // LOGIC: If the user doesn't specify a number, default to the maximum allowed (100).
        // If a number is provided, use it (capped at 100 for API safety).
        let deleteAmount = inputAmount || 100;

        // Extra check to prevent errors if the user inputs huge numbers
        if (deleteAmount > 100) {
            deleteAmount = 100;
        }

        try {
            // Delete messages
            // filterOld: true prevents trying to delete messages older than 14 days (which would cause a crash)
            const deletedMessages = await interaction.channel.bulkDelete(deleteAmount, true);

            // Reply to the user (Ephemeral = only they see it)
            await interaction.reply({
                content: `Ho cancellato con successo **${deletedMessages.size}** messaggi.`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'C è stato un errore durante la cancellazione dei messaggi. Assicurati che non siano più vecchi di 14 giorni.',
                ephemeral: true
            });
        }
    },
};