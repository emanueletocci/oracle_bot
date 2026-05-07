import { SlashCommandBuilder } from "discord.js";

const commandData = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Ottieni info su un utente o sul server!")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("user")
            .setDescription("Info su un utente")
            .addUserOption((option) =>
                option.setName("target").setDescription("L'utente da analizzare")
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("server").setDescription("Info sul server")
    );

export default {
    data: commandData,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "user") {
            const user = interaction.options.getUser("target") || interaction.user;

            await interaction.reply(`L'utente è: ${user.username}\nID: ${user.id}`);
        } else if (subcommand === "server") {
            const { guild } = interaction;
            // guild represent the server where the command was executed
            await interaction.reply(
                `Nome Server: ${guild.name}\nMembri totali: ${guild.memberCount}`
            );
        }
    },
};