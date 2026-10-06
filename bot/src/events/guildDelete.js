import { Events } from "discord.js";
import logger from "#utils/logger.js";
import { deleteGuildSettings } from "#settings/guildSettings.js";

export default {
	name: Events.GuildDelete,
	execute(guild) {
		deleteGuildSettings(guild.id);

		logger.info(`Left guild ${guild.name ?? "unknown"} (${guild.id})`);
		logger.info(`Now serving ${guild.client.guilds.cache.size} server(s)`);
	},
};