import { describe, it, expect } from "vitest";
import { createTheme } from "#themes/themeManager.js";

describe("theme.t() — risoluzione delle chiavi", () => {
	it("cade su neutral quando persona non sovrascrive la chiave", () => {
		const persona = createTheme("persona");
		const neutral = createTheme("neutral");
		// errors.generic esiste solo in neutral
		expect(persona.t("errors.generic")).toBe(neutral.t("errors.generic"));
	});

	it("usa il valore persona quando la chiave è sovrascritta", () => {
		const persona = createTheme("persona");
		const neutral = createTheme("neutral");
		expect(persona.t("coinflip.heads.title")).toContain("PHANTOM THIEVES");
		expect(persona.t("coinflip.heads.title")).not.toBe(neutral.t("coinflip.heads.title"));
	});

	it("applica le variabili alle funzioni-template", () => {
		const neutral = createTheme("neutral");
		expect(neutral.t("ship.selfShip", { user: "Tizio" })).toContain("Tizio");
	});

	it("ritorna la chiave stessa quando non esiste da nessuna parte", () => {
		const neutral = createTheme("neutral");
		expect(neutral.t("chiave.inesistente")).toBe("chiave.inesistente");
	});
});

describe("createTheme — fallback su tema sconosciuto", () => {
	it("ritorna il tema neutral", () => {
		const theme = createTheme("tema-che-non-esiste");
		expect(theme.name).toBe("neutral");
		expect(theme.color).toBe(createTheme("neutral").color);
	});
});
