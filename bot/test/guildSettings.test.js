import { describe, it, expect, beforeEach } from "vitest";
import { db } from "#database/db.js";
import { THEME_NAMES } from "#themes/themeManager.js";
import {
	getGuildSettings,
	createGuildSettings,
	setGuildTheme,
	resetGuildTheme,
	deleteGuildSettings,
} from "#settings/guildSettings.js";

const GUILD = "111111111111111111";

describe("guildSettings (SQLite)", () => {
	beforeEach(() => {
		db.prepare("DELETE FROM guild_settings").run();
	});

	it("default senza riga: tema valido, locale it, nessun canale, moduli tutti attivi", () => {
		const s = getGuildSettings(GUILD);
		expect(THEME_NAMES).toContain(s.theme);
		expect(s.locale).toBe("it");
		expect(s.welcomeChannelId).toBeNull();
		expect(s.modules).toMatchObject({
			fun: true,
			moderation: true,
			music: true,
			utility: true,
			persona: true,
		});
	});

	it("setGuildTheme persiste nel database", () => {
		setGuildTheme(GUILD, "neutral");
		expect(getGuildSettings(GUILD).theme).toBe("neutral");

		const row = db
			.prepare("SELECT theme FROM guild_settings WHERE guild_id = ?")
			.get(GUILD);
		expect(row.theme).toBe("neutral");
	});

	it("setGuildTheme con tema sconosciuto lancia un errore", () => {
		expect(() => setGuildTheme(GUILD, "tema-inesistente")).toThrow();
	});

	it("resetGuildTheme riporta al default", () => {
		const before = getGuildSettings(GUILD).theme;
		setGuildTheme(GUILD, "neutral");
		resetGuildTheme(GUILD);
		expect(getGuildSettings(GUILD).theme).toBe(before);
	});

	it("deleteGuildSettings riporta ai default", () => {
		const before = getGuildSettings(GUILD).theme;
		setGuildTheme(GUILD, "neutral");
		deleteGuildSettings(GUILD);
		expect(getGuildSettings(GUILD).theme).toBe(before);
	});

	it("createGuildSettings è idempotente (non sovrascrive una riga esistente)", () => {
		createGuildSettings(GUILD);
		setGuildTheme(GUILD, "neutral");
		createGuildSettings(GUILD);
		expect(getGuildSettings(GUILD).theme).toBe("neutral");
	});

	it("migrazioni: tabelle presenti e una sola versione applicata", () => {
		const tables = db
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
			.all()
			.map((row) => row.name);

		expect(tables).toContain("guild_settings");
		expect(tables).toContain("schema_migrations");

		const count = db.prepare("SELECT COUNT(*) AS c FROM schema_migrations").get();
		expect(count.c).toBe(1);
	});
});
