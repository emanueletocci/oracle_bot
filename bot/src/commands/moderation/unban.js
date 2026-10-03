import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import logger from "../../utils/logger.js";

export default {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Rimuove il ban di un utente")
        .addStringOption(option =>
            option
                .setName("userid")
                .setDescription("ID dell'utente da sbannare")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Motivo dell'unban")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.options.getString("userid");
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const snowflakeRegex = /^[0-9]{17,19}$/;

        if (!snowflakeRegex.test(userId)) {
            return interaction.editReply({
                content: "L'ID utente non è valido.",
            });
        }

        try {
            const ban = await interaction.guild.bans.fetch(userId).catch(() => null);

            if (!ban) {
                logger.warn(`User ${userId} is not banned in guild ${interaction.guild.name}`);
                return interaction.editReply({
                    content: "Questo utente non risulta bannato.",
                });
            }

            await interaction.guild.members.unban(userId, reason);

            logger.info(`${ban.user.tag} (${userId}) unbanned by ${interaction.user.tag}. Reason: ${reason}`);

            return interaction.editReply({
                content: `✅ ${ban.user.tag} è stato sbannato con successo. Motivo: ${reason}`,
            });
        } catch (error) {
            logger.error(`Failed to unban ${userId}: ${error.message}`);

            return interaction.editReply({
                content: "Si è verificato un errore durante l'unban dell'utente.",
            });
        }
    },
};