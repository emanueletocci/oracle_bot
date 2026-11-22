// /theme — shows and changes the bot theme of the guild.
//
// This is the first command backed by the per-guild settings database:
// a theme change here survives bot restarts (see settings/guildSettings.js).
import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	MessageFlags,
	EmbedBuilder,
} from "discord.js";
import { THEME_NAMES, createTheme } from "#themes/themeManager.js";
import {
	getGuildSettings,
	setGuildTheme,
	resetGuildTheme,
} from "#settings/guildSettings.js";

export default {
	data: new SlashCommandBuilder()
		.setName("theme")
		.setDescription("Mostra o cambia il tema del bot in questo server")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("list")
				.setDescription("Mostra i temi disponibili"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("set")
				.setDescription("Imposta il tema di questo server")
				.addStringOption((option) =>
					option
						.setName("name")
						.setDescription("Il tema da attivare")
						.setRequired(true)
						// Fixed choices work up to 25 items: plenty for the two
						// built-in themes. Theme packs (phase 3) may need
						// autocomplete instead.
						.addChoices(
							...THEME_NAMES.map((name) => ({ name, value: name })),
						),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("reset")
				.setDescription("Ripristina il tema predefinito"),
		),

	async execute(interaction, { theme }) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "list") {
			const { theme: current } = getGuildSettings(interaction.guildId);
			const list = THEME_NAMES.map((themeName) => `**${themeName}**`).join(" · ");

			const embed = new EmbedBuilder()
				.setTitle(theme.t("theme.listTitle"))
				.setColor(theme.color)
				.setDescription(
					`${theme.t("theme.listActive", { current })}\n\n${theme.t("theme.listAvailable", { list })}`,
				);

			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === "set") {
			const requested = interaction.options.getString("name");

			// The option is a fixed choice list, but stay safe anyway.
			if (!THEME_NAMES.includes(requested)) {
				return interaction.reply({
					content: theme.t("theme.invalid"),
					flags: MessageFlags.Ephemeral,
				});
			}

			setGuildTheme(interaction.guildId, requested);

			// Answer with the voice of the NEW theme, so the admin
			// immediately sees the style they switched to.
			const newTheme = createTheme(requested);
			return interaction.reply(newTheme.t("theme.setDone", { name: requested }));
		}

		// --- reset ---
		resetGuildTheme(interaction.guildId);
		const resetTheme = createTheme(
			getGuildSettings(interaction.guildId).theme,
		);
		return interaction.reply(
			resetTheme.t("theme.resetDone", { name: resetTheme.name }),
		);
	},
};
