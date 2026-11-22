// Per-guild settings, persisted in SQLite (see src/database/db.js).
//
// The rest of the bot only uses the functions exported below: if the storage
// changes again (e.g. a remote dashboard API), only this file changes.
import config from "#config" with { type: "json" };
import { db } from "#database/db.js";
import { THEME_NAMES, createTheme } from "#themes/themeManager.js";

const DEFAULT_THEME = THEME_NAMES.includes(config.defaultTheme)
	? config.defaultTheme
	: "persona";

// Modules enabled when a guild has no explicit toggles. Phase 2 will expose
// these to admins; for now every module is active everywhere.
const DEFAULT_MODULES = {
	fun: true,
	moderation: true,
	music: true,
	utility: true,
	persona: true,
};

// -----------------------------------------------------------------------------
// PREPARED STATEMENTS
// -----------------------------------------------------------------------------
const selectRow = db.prepare("SELECT * FROM guild_settings WHERE guild_id = ?");

const insertDefaultRow = db.prepare(`
	INSERT OR IGNORE INTO guild_settings (guild_id, theme)
	VALUES (?, ?)
`);

const deleteRow = db.prepare("DELETE FROM guild_settings WHERE guild_id = ?");

const updateTheme = db.prepare(`
	UPDATE guild_settings
	SET theme = ?, updated_at = datetime('now')
	WHERE guild_id = ?
`);

const updateWelcomeChannel = db.prepare(`
	UPDATE guild_settings
	SET welcome_channel_id = ?, updated_at = datetime('now')
	WHERE guild_id = ?
`);

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
// Converts a database row into the settings object used by the rest of the
// bot. A missing row (DMs, unknown guild) falls back to the defaults.
function toSettings(row) {
	if (!row) {
		return {
			theme: DEFAULT_THEME,
			locale: "it",
			welcomeChannelId: null,
			modules: { ...DEFAULT_MODULES },
		};
	}

	return {
		theme: THEME_NAMES.includes(row.theme) ? row.theme : DEFAULT_THEME,
		locale: row.locale ?? "it",
		welcomeChannelId: row.welcome_channel_id ?? null,
		// The stored JSON only contains the explicit toggles: everything
		// missing falls back to the defaults.
		modules: { ...DEFAULT_MODULES, ...JSON.parse(row.modules ?? "{}") },
	};
}

// Makes sure the guild has a settings row, then updates a column on it.
function updateGuild(guildId, statement, value) {
	insertDefaultRow.run(guildId, DEFAULT_THEME);
	statement.run(value, guildId);
}

// -----------------------------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------------------------
export function getGuildSettings(guildId) {
	if (!guildId) return toSettings(null);
	return toSettings(selectRow.get(guildId));
}

// Creates the settings row for a newly joined guild (idempotent: a row that
// already exists is kept untouched).
export function createGuildSettings(guildId) {
	insertDefaultRow.run(guildId, DEFAULT_THEME);
}

export function setGuildTheme(guildId, theme) {
	if (!THEME_NAMES.includes(theme)) {
		throw new Error(`Unknown theme "${theme}"`);
	}
	updateGuild(guildId, updateTheme, theme);
}

export function setGuildWelcomeChannel(guildId, channelId) {
	updateGuild(guildId, updateWelcomeChannel, channelId);
}

// Puts the guild back on the default theme of config.json.
export function resetGuildTheme(guildId) {
	setGuildTheme(guildId, DEFAULT_THEME);
}

// Removes the settings of a guild (e.g. when the bot is kicked). If the bot
// is added again, it starts from the defaults, like before.
export function deleteGuildSettings(guildId) {
	deleteRow.run(guildId);
}

// Shortcut: the ready-to-use theme of a guild.
export function getGuildTheme(guildId) {
	return createTheme(getGuildSettings(guildId).theme);
}
