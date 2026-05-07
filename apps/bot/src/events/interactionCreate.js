import { Events, MessageFlags, Collection } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const { client, commandName } = interaction;
        const command = client.commands.get(commandName);

        if (!command) {
            console.error(`No command matching ${commandName} was found.`);
            return;
        }

        // --- INIZIO COOLDOWN ---
        const { cooldowns } = client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000);
                return interaction.reply({
                    content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        // --- FINE COOLDOWN ---

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errorMessage = {
                content: "There was an error while executing this command!",
                flags: MessageFlags.Ephemeral,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};