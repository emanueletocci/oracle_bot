import { Events, ActivityType } from "discord.js";
import logger from "#utils/logger.js";

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		logger.info(
			`Client ready: logged in as ${client.user.tag} (${client.user.id})`,
		);
		client.user.setActivity("Scanning for shadows", { type: ActivityType.Watching });
	},
};
