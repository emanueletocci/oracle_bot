import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { SRC_DIR } from "#utils/paths.js";
import { createTheme } from "#themes/themeManager.js";
import chars from "#data/characters.js";

const persona = createTheme("persona");

describe("ship.outcome (persona) — fasce per percentuale", () => {
	const bucketCases = [
		[0, "igor"],
		[10, "takemi"],
		[20, "mona"],
		[50, "crow"],
		[60, "ohya"],
		[80, "panther"],
		[90, "lavenza"],
	];

	it.each(bucketCases)("percent %i → %s", (percent, name) => {
		const outcome = persona.t("ship.outcome", { percent });
		expect(outcome.arcana).toBe(chars[name].arcana);
	});

	it("69 → skull (For real?!)", () => {
		expect(persona.t("ship.outcome", { percent: 69 }).arcana).toBe(chars.skull.arcana);
	});

	it("77 → chihaya (Jackpot!)", () => {
		expect(persona.t("ship.outcome", { percent: 77 }).arcana).toBe(chars.chihaya.arcana);
	});

	it("99 → calling card speciale", () => {
		const outcome = persona.t("ship.outcome", { percent: 99 });
		expect(outcome.arcana).toBe("THE JOLLY");
		expect(outcome.message).toContain("1%");
	});
});

describe("ship.outcome (neutral) — solo messaggio", () => {
	it("non ha arcana", () => {
		const outcome = createTheme("neutral").t("ship.outcome", { percent: 50 });
		expect(outcome.arcana).toBeUndefined();
		expect(outcome.message).toBeTruthy();
	});
});

describe("integrità dati del tema persona", () => {
	it("tutti i chars.X referenziati esistono in characters.js", () => {
		const source = fs.readFileSync(path.join(SRC_DIR, "themes", "persona.js"), "utf8");
		const names = [...source.matchAll(/chars\.([a-zA-Z]+)/g)].map((m) => m[1]);
		const missing = [...new Set(names)].filter((name) => !(name in chars));
		expect(missing).toEqual([]);
	});
});
