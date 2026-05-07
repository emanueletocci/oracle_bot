import { SlashCommandBuilder, Events } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('testwelcome')
        .setDescription('Simula il benvenuto per testare la grafica'),
        
    async execute(interaction) {
        // 1. Rispondiamo subito all'utente (per non dare errore "interazione fallita")
        await interaction.reply({ content: 'Simulazione benvenuto avviata! Guarda il canale.', ephemeral: true });

        // 2. MAGIA: Emettiamo manualmente l'evento
        // 'interaction.member' sei tu che hai digitato il comando.
        // Il bot riceverà questo evento come se fossi appena entrato.
        interaction.client.emit(Events.GuildMemberAdd, interaction.member);
    },
};