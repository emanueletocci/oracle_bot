// SQLite database (better-sqlite3): a single file on disk, opened once at
// startup and shared by the whole process.
//
// better-sqlite3 is synchronous: no awaits anywhere, and queries on a local
// file are faster than any Discord API call. WAL mode lets a second process
// (the future dashboard) read and write the same file while the bot runs.
//
// MIGRATIONS: each entry of MIGRATIONS is plain SQL applied exactly once, in
// order. Applied versions are tracked in the schema_migrations table. To
// change the schema, append a new entry: never edit an old one.
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import logger from "#utils/logger.js";
import { DATABASE_PATH } from "#utils/paths.js";

// The data folder must exist before the database file can be created
fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });

export const db = new Database(DATABASE_PATH);
db.pragma("journal_mode = WAL");

const MIGRATIONS = [
	{
		version: 1,
		name: "guild_settings",
		sql: `
			CREATE TABLE guild_settings (
				guild_id           TEXT PRIMARY KEY,
				locale             TEXT NOT NULL DEFAULT 'it',
				theme              TEXT NOT NULL DEFAULT 'persona',
				welcome_channel_id TEXT,
				modules            TEXT NOT NULL DEFAULT '{}',
				overrides          TEXT,
				created_at         TEXT NOT NULL DEFAULT (datetime('now')),
				updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
			);
		`,
	},
	{
		version: 2,
		name: "guild_radio_stations",
		sql: `
			CREATE TABLE guild_radio_stations (
				guild_id TEXT NOT NULL,
				name     TEXT NOT NULL,
				url      TEXT NOT NULL,
				PRIMARY KEY (guild_id, name)
			);
		`,
	},
];

db.exec(`
	CREATE TABLE IF NOT EXISTS schema_migrations (
		version    INTEGER PRIMARY KEY,
		applied_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
`);

const appliedVersions = new Set(
	db
		.prepare("SELECT version FROM schema_migrations")
		.all()
		.map((row) => row.version),
);

for (const { version, name, sql } of MIGRATIONS) {
	if (appliedVersions.has(version)) continue;

	db.exec(sql);
	db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(version);
	logger.info(`Database migration ${version} (${name}) applied.`);
}
