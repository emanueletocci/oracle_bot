import { describe, it, expect, beforeEach } from "vitest";
import { db } from "#database/db.js";
import { RADIO_STATIONS } from "#data/radio.js";

const GUILD = "999999999999999999";

const upsert = db.prepare(`
	INSERT INTO guild_radio_stations (guild_id, name, url)
	VALUES (?, ?, ?)
	ON CONFLICT(guild_id, name) DO UPDATE SET url = excluded.url
`);
const getOne = db.prepare("SELECT url FROM guild_radio_stations WHERE guild_id = ? AND name = ?");
const del = db.prepare("DELETE FROM guild_radio_stations WHERE guild_id = ? AND name = ?");

beforeEach(() => {
	db.prepare("DELETE FROM guild_radio_stations WHERE guild_id = ?").run(GUILD);
});

describe("guild_radio_stations", () => {
	it("il data file contiene stazioni valide con URL http(s)", () => {
		for (const station of RADIO_STATIONS) {
			expect(station.name).toBeTruthy();
			expect(station.url).toMatch(/^https?:\/\//);
		}
	});

	it("upsert e get funzionano", () => {
		upsert.run(GUILD, "Pippo", "https://radio.example/tunein.aac");
		const row = getOne.get(GUILD, "Pippo");
		expect(row.url).toBe("https://radio.example/tunein.aac");
	});

	it("l'upsert aggiorna l'URL esistente (non duplica)", () => {
		upsert.run(GUILD, "Pippo", "https://a.example/1");
		upsert.run(GUILD, "Pippo", "https://b.example/2");
		const count = db
			.prepare("SELECT COUNT(*) AS c FROM guild_radio_stations WHERE guild_id = ? AND name = ?")
			.get(GUILD, "Pippo");
		expect(count.c).toBe(1);
		expect(getOne.get(GUILD, "Pippo").url).toBe("https://b.example/2");
	});

	it("delete rimuove solo la stazione scelta", () => {
		upsert.run(GUILD, "A", "https://a.example/1");
		upsert.run(GUILD, "B", "https://b.example/2");
		del.run(GUILD, "A");
		expect(getOne.get(GUILD, "A")).toBeUndefined();
		expect(getOne.get(GUILD, "B").url).toBe("https://b.example/2");
	});
});