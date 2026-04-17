import fs from "node:fs";
import path from "node:path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import config from "./config.json" with { type: "json" };
import logger from "./utils/logger.js";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DisTube } from "distube";
import { YouTubePlugin } from "@distube/youtube";
import { DirectLinkPlugin } from "@distube/direct-link";
import { SoundCloudPlugin } from "@distube/soundcloud";

const { token } = config;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
	],
});

client.commands = new Collection();
client.cooldowns = new Collection();

client.distube = new DisTube(client, {
	emitNewSongOnly: true,
	plugins: [
		new DirectLinkPlugin(),
        new SoundCloudPlugin(),
		new YouTubePlugin(),
	],
});

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const imported = await import(pathToFileURL(filePath).href);
		const command = imported.default || imported;

		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			logger.info(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);

	const imported = await import(pathToFileURL(filePath).href);
	const event = imported.default || imported;

	if (event.distube) {
		client.distube.on(event.name, (...args) => event.execute(...args));
	} else if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);
