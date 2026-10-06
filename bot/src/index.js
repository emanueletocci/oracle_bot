import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { Client, Collection, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";
import { YouTubePlugin } from "@distube/youtube";
import { DirectLinkPlugin } from "@distube/direct-link";
import { SoundCloudPlugin } from "@distube/soundcloud";

import config from "#config" with { type: "json" };
import logger from "#utils/logger.js";
import { loadCommands } from "#utils/commandLoader.js";
import { EVENTS_DIR } from "#utils/paths.js";

const { token } = config;

// -----------------------------------------------------------------------------
// CLIENT
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// COMMANDS
// -----------------------------------------------------------------------------
const commands = await loadCommands();
for (const command of commands) {
	client.commands.set(command.data.name, command);
}
logger.info(`Loaded ${commands.length} commands.`);

// -----------------------------------------------------------------------------
// EVENTS
// -----------------------------------------------------------------------------
const eventFiles = fs
	.readdirSync(EVENTS_DIR)
	.filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(EVENTS_DIR, file);

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

// -----------------------------------------------------------------------------
// START
// -----------------------------------------------------------------------------

// Safety net: log errors that nobody caught, instead of crashing the bot
process.on("unhandledRejection", (reason) =>
	logger.error("Unhandled rejection", reason),
);

client.login(token);
