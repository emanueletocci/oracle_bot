import { Events, MessageFlags, Collection } from "discord.js";
import logger from "#utils/logger.js";
import { getGuildTheme } from "#settings/guildSettings.js";
import { randomUUID } from "node:crypto";

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
		const defaultCooldownDuration = 3;
		const cooldownAmount =
			(command.cooldown ?? defaultCooldownDuration) * 1_000;

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
			logger.error(
				`${ctx} fallito dopo ${Math.round(performance.now() - start)}ms`,
				error,
			);

			const errorMessage = {
				content: theme.t("errors.generic"),
				flags: MessageFlags.Ephemeral,
			};
			try {
				if (interaction.replied || interaction.deferred)
					await interaction.followUp(errorMessage);
				else await interaction.reply(errorMessage);
			} catch {
				const errorId = randomUUID().slice(0, 8);
				logger.error(`[${errorId}] /${commandName} fallito`, error);

				const errorMessage = {
					content: `${theme.t("errors.generic")} (codice: \`${errorId}\`)`,
					flags: MessageFlags.Ephemeral,
				};
			}
		}
	},
};
