import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import logger from "../../utils/logger.js";

export default {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Espelle un utente dal server")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Utente da espellere")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Motivo del kick")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("target");
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => {
            logger.warn(`User ${targetUser.tag} not found in guild ${interaction.guild.name}`);
            return null;
        });

        if (!member) {
            return interaction.reply({
                content: `L'utente ${targetUser.tag} non è presente nel server.`,
                ephemeral: true,
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: "Non puoi espellere te stesso.",
                ephemeral: true,
            });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: "Non puoi espellere il proprietario del server.",
                ephemeral: true,
            });
        }

        if (!member.kickable) {
            logger.warn(`User ${targetUser.tag} is not kickable. Check bot permissions and role hierarchy.`);
            return interaction.reply({
                content: "Non posso espellere questo utente. Controlla gerarchia ruoli e permessi del bot.",
                ephemeral: true,
            });
        }

        const executor = interaction.member;
        const isOwner = executor.id === interaction.guild.ownerId;

        if (!isOwner && executor.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            logger.warn(`User ${targetUser.tag} is not kickable. Check bot permissions and role hierarchy.`);
            return interaction.reply({
                content: "Non puoi espellere un utente con ruolo uguale o superiore al tuo.",
                ephemeral: true,
            });
        }

        try {
            await member.send(
                `Sei stato espulso da **${interaction.guild.name}**.\nMotivo: ${reason}`
            );
        } catch (error) {
            logger.error(`Failed to send DM to ${targetUser.tag}: ${error.message}`);
        }

        try {
            await member.kick(reason);
            logger.info(`${targetUser.tag} kicked by ${interaction.user.tag}. Reason: ${reason}`);

            return interaction.reply({
                content: `✅ ${targetUser.tag} è stato espulso con successo. Motivo: ${reason}`,
                ephemeral: true,
            });
        } catch (error) {
            logger.error(`Failed to kick ${targetUser.tag}: ${error.message}`);

            return interaction.reply({
                content: "Si è verificato un errore durante il kick dell'utente.",
                ephemeral: true,
            });
        }
    },
};