import { REST, Routes } from 'discord.js';
import config from '../config.json' with { type: 'json' };
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import logger from './utils/logger.js';

const { clientId, guildId, token } = config;

// Reconstruct global variables for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

// Read all command folders from the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Read all command files from the current folder
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

    // Load each command module and collect its JSON definition for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        // In ESM, use dynamic await import() instead of require()
        const imported = await import(pathToFileURL(filePath).href);
        const command = imported.default || imported;

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            logger.warn(`Command module is missing required "data" or "execute" property: ${filePath}`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy application commands
(async () => {
    try {
        logger.info(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method fully refreshes all guild commands using the current command set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        logger.error(`Failed to deploy application commands: ${error.message}`);
    }
})();