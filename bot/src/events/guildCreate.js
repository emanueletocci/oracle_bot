import { Events } from "discord.js";
import logger from "#utils/logger.js";

export default {
	name: Events.GuildCreate,
	execute(guild) {
		logger.info(`Joined guild ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
		logger.info(`Now serving ${guild.client.guilds.cache.size} server(s)`);
	},
};