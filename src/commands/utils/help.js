import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import colors from '../../utils/colors.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lista tutti i comandi disponibili'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📚 Lista Comandi')
            .setColor(colors.p5_red)
            .setDescription('Ecco tutti i comandi che puoi usare:');

        const fields = [...interaction.client.commands.values()]
            .sort((a, b) => a.data.name.localeCompare(b.data.name)) // 2. Sort the Array
            .map(cmd => {
                if (cmd.enabled === false) return null;
                return {
                    name: `/${cmd.data.name}`,
                    value: cmd.data.description || 'Nessuna descrizione',
                    inline: false
                };
            })
            .filter(Boolean); // 3. Filter nulls

        embed.addFields(fields);
        await interaction.reply({ embeds: [embed] });
    },
};