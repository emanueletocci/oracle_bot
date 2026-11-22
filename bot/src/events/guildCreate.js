import { Events } from "discord.js";
import logger from "#utils/logger.js";
import { createGuildSettings } from "#settings/guildSettings.js";

export default {
	name: Events.GuildCreate,
	execute(guild) {
		// Create the guild's settings row, starting from the default theme
		// of config.json (see settings/guildSettings.js).
		createGuildSettings(guild.id);

		logger.info(`Joined guild ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
		logger.info(`Now serving ${guild.client.guilds.cache.size} server(s)`);
	},
};