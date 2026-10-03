import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { importCommand } from "#utils/commandLoader.js";
import logger from "#utils/logger.js";

export default {
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Reloads a command.")
		.addStringOption((option) =>
			option
				.setName("command")
				.setDescription("The command to reload.")
				.setRequired(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		const commandName = interaction.options.getString("command", true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply({
				content: `There is no command with name \`${commandName}\`!`,
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			// ESM has no require.cache: importCommand adds a query string to force a fresh import
			const newCommand = await importCommand(command.filePath, { bustCache: true });
			if (!newCommand) throw new Error("the reloaded file is not a valid command");

			interaction.client.commands.set(newCommand.data.name, newCommand);
			await interaction.reply({
				content: `Command \`${newCommand.data.name}\` was reloaded!`,
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (error) {
			logger.error(`Failed to reload command ${commandName}: ${error.message}`);
			await interaction.reply({
				content: `There was an error while reloading \`${commandName}\`:\n\`${error.message}\``,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
