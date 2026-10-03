import logger from "#utils/logger.js";
import { getGuildTheme } from "#settings/guildSettings.js";

export default {
	name: "error",
	distube: true,
	execute(...args) {
		let errorObject = null;
		let targetChannel = null;

		// Inspect all parameters emitted by DisTube
		for (const arg of args) {
			if (arg instanceof Error) {
				// We found the error object
				errorObject = arg;
			} else if (arg && typeof arg.send === "function") {
				// We found the text channel
				targetChannel = arg;
			} else if (
				arg &&
				arg.textChannel &&
				typeof arg.textChannel.send === "function"
			) {
				// We found the queue, so we extract the channel from it
				targetChannel = arg.textChannel;
			}
		}

		// Extract the error text (or fall back to a default message if unavailable)
		const errorMessage =
			errorObject?.message ||
			String(errorObject || args[0] || "Unknown error");

		const theme = getGuildTheme(targetChannel?.guildId);
		let discordMessage = theme.t("music.error", { message: errorMessage });

		// Prevent crashes caused by Discord's message length limit (2000 characters max)
		if (discordMessage.length > 1950) {
			discordMessage = theme.t("music.criticalError");
		}

		// Log the technical error with full context
		if (errorObject) {
			logger.error(`DisTube error event: ${errorObject.message}`);
		} else {
			logger.error(`DisTube error event received without Error instance: ${JSON.stringify(args)}`);
		}

		// If we found a valid channel, send the warning there
		if (targetChannel) {
			targetChannel.send(discordMessage).catch((sendError) => {
				logger.error(`Failed to send DisTube error message to channel: ${sendError.message}`);
			});
		} else {
			// Otherwise, log that no valid text channel was available
			logger.error("DisTube error event could not resolve a valid text channel.");
		}
	},
};