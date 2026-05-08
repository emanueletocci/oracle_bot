import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import logger from "../../utils/logger.js";

export default {
    data: new SlashCommandBuilder()
        .setName("banlist")
        .setDescription("Mostra la lista degli utenti bannati")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const bans = await interaction.guild.bans.fetch();

            if (bans.size === 0) {
                logger.info("No banned users found");
                return interaction.editReply({
                    content: "Non ci sono utenti bannati in questo server.",
                });
            }

            const banList = bans.map((ban) => {
                const reason = ban.reason ?? "Nessun motivo";
                return `• ${ban.user.tag} (${ban.user.id}) - ${reason}`;
            });

            let content = `**Utenti bannati: ${bans.size}**\n\n${banList.join("\n")}`;

            if (content.length > 1900) {
                content = content.slice(0, 1900) + "\n...";
            }

            return interaction.editReply({
                content,
            });
        } catch (error) {
            logger.error(`Error during ban list retrieval: ${error.message}`);

            return interaction.editReply({
                content: "Si è verificato un errore durante il recupero della ban list.",
            });
        }
    },
};