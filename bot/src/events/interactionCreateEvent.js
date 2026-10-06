import { Events, MessageFlags, Collection } from "discord.js";
import { randomUUID } from "node:crypto";
import logger from "#utils/logger.js";
import { getGuildTheme } from "#settings/guildSettings.js";

const DEFAULT_COOLDOWN_SECONDS = 3;

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const { client, commandName } = interaction;
		const command = client.commands.get(commandName);

		if (!command) {
			logger.error(`No command matching ${commandName} was found.`);
			return;
		}

		// ---------------------------------------------------------------------
		// THEME CHECK
		// ---------------------------------------------------------------------

		// Each guild has a theme (persona or neutral). Commands in the
		// "persona" module only exist inside the Persona theme.
		const theme = getGuildTheme(interaction.guildId);

		if (command.module === "persona" && theme.name !== "persona") {
			return interaction.reply({
				content: theme.t("errors.personaOnly"),
				flags: MessageFlags.Ephemeral,
			});
		}

		// ---------------------------------------------------------------------
		// COOLDOWN CHECK
		// ---------------------------------------------------------------------
		const { cooldowns } = client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const cooldownAmount =
			(command.cooldown ?? DEFAULT_COOLDOWN_SECONDS) * 1_000;

		if (timestamps.has(interaction.user.id)) {
			const expirationTime =
				timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1_000);
				return interaction.reply({
					content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

		// ---------------------------------------------------------------------
		// COMMAND EXECUTION
		// ---------------------------------------------------------------------
		const start = performance.now();
		const ctx = `/${commandName} user=${interaction.user.id} guild=${interaction.guildId}`;

		try {
			await command.execute(interaction, { theme });
			logger.debug(`${ctx} ok in ${Math.round(performance.now() - start)}ms`);
		} catch (error) {
			// Short code shown to the user and written in the log,
			// so the error can be found quickly when someone reports it.
			const errorId = randomUUID().slice(0, 8);
			const ms = Math.round(performance.now() - start);
			logger.error(`[${errorId}] ${ctx} failed after ${ms}ms`, error);

			const errorMessage = {
				content: `${theme.t("errors.generic")} (code: \`${errorId}\`)`,
				flags: MessageFlags.Ephemeral,
			};

			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp(errorMessage);
				} else {
					await interaction.reply(errorMessage);
				}
			} catch {
				// The interaction has expired: we can't answer anymore,
				// but the error is already in the log.
			}
		}
	},
};
