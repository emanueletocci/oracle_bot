import fs from "node:fs";
import path from "node:path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import config from "#config" with { type: "json" };
import logger from "#utils/logger.js";
import { loadCommands } from "#utils/commandLoader.js";
import { SRC_DIR } from "#utils/paths.js";
import { pathToFileURL } from "node:url";
import { DisTube } from "distube";
import { YouTubePlugin } from "@distube/youtube";
import { DirectLinkPlugin } from "@distube/direct-link";
import { SoundCloudPlugin } from "@distube/soundcloud";

const { token } = config;

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

const commands = await loadCommands();
for (const command of commands) {
	client.commands.set(command.data.name, command);
}
logger.info(`Loaded ${commands.length} commands.`);

const eventsPath = path.join(SRC_DIR, "events");
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
