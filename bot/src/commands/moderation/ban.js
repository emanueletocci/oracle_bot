import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import logger from "../../utils/logger.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Banna un utente dal server")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Utente da bannare")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Motivo del ban")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("target");
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                content: `L'utente ${targetUser.tag} non è presente nel server.`,
                ephemeral: true,
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: "Non puoi bannare te stesso.",
                ephemeral: true,
            });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({
                content: "Non puoi bannare il proprietario del server.",
                ephemeral: true,
            });
        }

        if (!member.bannable) {
            return interaction.reply({
                content: "Non posso bannare questo utente. Controlla gerarchia ruoli e permessi del bot.",
                ephemeral: true,
            });
        }

        const executor = interaction.member;
        const isOwner = executor.id === interaction.guild.ownerId;

        if (!isOwner && executor.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
            return interaction.reply({
                content: "Non puoi bannare un utente con ruolo uguale o superiore al tuo.",
                ephemeral: true,
            });
        }

        try {
            await member.send(
                `Ciao ${targetUser.username}, sei stato bannato da **${interaction.guild.name}**.\nMotivo: ${reason}`
            );
        } catch (error) {
            logger.warn(`DM non inviato a ${targetUser.tag}: ${error.message}`);
        }

        try {
            await member.ban({ reason });

            logger.info(`${targetUser.tag} banned by ${interaction.user.tag}. Reason: ${reason}`);

            return interaction.reply({
                content: `✅ ${targetUser.tag} è stato bannato con successo. Motivo: ${reason}`,
                ephemeral: true,
            });
        } catch (error) {
            logger.error(`Failed to ban ${targetUser.tag}: ${error.message}`);

            return interaction.reply({
                content: "Si è verificato un errore durante il ban dell'utente.",
                ephemeral: true,
            });
        }
    },
};