import { REST, Routes, InteractionContextType } from "discord.js";
import config from "#config" with { type: "json" };
import logger from "#utils/logger.js";
import { loadCommands } from "#utils/commandLoader.js";

const { clientId, guildId, token } = config;

const commands = await loadCommands();

// core + persona → global commands (available in every server the bot joins).
// They only make sense inside a server, so they are hidden in DMs.
const globalCommands = commands
	.filter((command) => command.module !== "dev")
	.map((command) => {
		const json = command.data.toJSON();
		json.contexts ??= [InteractionContextType.Guild];
		return json;
	});

// dev → registered only in the development guild (config.guildId)
const devCommands = commands
	.filter((command) => command.module === "dev")
	.map((command) => command.data.toJSON());

const rest = new REST().setToken(token);

try {
	logger.info(`Deploying ${globalCommands.length} global commands...`);
	const deployed = await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
	logger.info(`Successfully deployed ${deployed.length} global commands.`);

	if (guildId) {
		// PUT replaces the whole guild command list: this also removes old
		// guild copies of core/persona commands, which would otherwise show
		// up twice next to the global ones.
		logger.info(`Deploying ${devCommands.length} dev commands to guild ${guildId}...`);
		const deployedDev = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: devCommands },
		);
		logger.info(`Successfully deployed ${deployedDev.length} dev commands.`);
	}
	else {
		logger.warn("No guildId in config.json: dev commands were not deployed.");
	}
}
catch (error) {
	logger.error(`Failed to deploy application commands: ${error.message}`);
	process.exitCode = 1;
}
