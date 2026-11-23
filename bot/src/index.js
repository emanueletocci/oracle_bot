import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { Client, Collection, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";
import { DirectLinkPlugin } from "@distube/direct-link";
import { YouTubePlugin as YtdlCorePlugin } from "@distube/youtube";
// yt-dlp: more robust than ytdl-core against YouTube format changes.
// CommonJS module, so take the plugin off the default export.
import ytdlpPkg from "@distube/yt-dlp";
const YtDlpPlugin = ytdlpPkg.YtDlpPlugin;

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
	// One retry only: with the default (3), a stalled upload keeps the
	// interaction hanging for minutes with zero feedback for the user.
	rest: {
		retries: 1,
		timeout: 15_000,
		// Several dependencies ship their own undici copy (6 for @discordjs/rest,
		// 7/8 for distube and ytdl-core) and all of them share one global
		// dispatcher through Symbol.for("undici.globalDispatcher.1"). When the
		// newer copy creates it, REST dispatches through undici 8, which rejects
		// Node's FormData: every file upload dies with "body must be a FormData
		// created by this undici package instance" (/slap, welcome images).
		// Global fetch keeps FormData and the request in the same implementation.
		makeRequest: fetch,
	},
});

client.commands = new Collection();
client.cooldowns = new Collection();

// SoundCloud is excluded on purpose: its shared links resolve to DRM-protected
// HLS streams ("skd://..." AES keys) that ffmpeg cannot open, which breaks
// playback (exit code 183) before YouTube gets a chance. YouTube + direct
// links cover essentially all song sources.
const distubeOptions = {
	emitNewSongOnly: true,
	plugins: [
		new DirectLinkPlugin(),
		new YtdlCorePlugin(),
		new YtDlpPlugin(),
	],
};

if (fs.existsSync("/usr/bin/ffmpeg")) {
	distubeOptions.ffmpeg = { path: "/usr/bin/ffmpeg" };
}

client.distube = new DisTube(client, distubeOptions);

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
