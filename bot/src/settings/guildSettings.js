// Per-guild settings.
//
// TEMPORARY in-memory implementation: every guild uses the default theme from
// config.json until the SQLite database (and the dashboard API) are added.
// Only the internals of this file will change then: the rest of the bot
// already goes through getGuildSettings / setGuildTheme.
import config from "#config" with { type: "json" };
import { THEME_NAMES, createTheme } from "#themes/index.js";

const DEFAULT_THEME = THEME_NAMES.includes(config.defaultTheme)
	? config.defaultTheme
	: "persona";

const overrides = new Map();

export function getGuildSettings(guildId) {
	if (!guildId) return { theme: DEFAULT_THEME };
	return overrides.get(guildId) ?? { theme: DEFAULT_THEME };
}

export function setGuildTheme(guildId, theme) {
	if (!THEME_NAMES.includes(theme)) {
		throw new Error(`Unknown theme "${theme}"`);
	}
	overrides.set(guildId, { theme });
}

// Shortcut: the ready-to-use theme of a guild.
export function getGuildTheme(guildId) {
	return createTheme(getGuildSettings(guildId).theme);
}
