import { describe, it, expect, beforeEach, vi } from "vitest";

// La risoluzione delle immagini dipende da ASSET_BASE_URL, letta all'import:
// con vi.resetModules() + import dinamico possiamo testare entrambi i casi.
describe("risoluzione delle immagini del tema", () => {
	beforeEach(() => {
		vi.resetModules();
		delete process.env.ORACLE_ASSET_BASE_URL;
	});

	it("usa un URL CDN quando ASSET_BASE_URL è impostata (default)", async () => {
		const { createTheme } = await import("#themes/themeManager.js");
		const image = createTheme("persona").t("coinflip.heads").image;

		expect(image).toMatch(/^https:\/\/cdn\.jsdelivr\.net/);
		expect(image).toContain("coinJoker.webp");
	});

	it("usa un percorso locale quando ASSET_BASE_URL è vuota", async () => {
		process.env.ORACLE_ASSET_BASE_URL = "";
		const { createTheme } = await import("#themes/themeManager.js");
		const image = createTheme("persona").t("coinflip.heads").image;

		expect(image).not.toMatch(/^https?:\/\//);
		expect(image).toContain("coins");
		expect(image).toContain("coinJoker.webp");
	});

	it("le immagini dei personaggi (ship) seguono la stessa regola", async () => {
		const { createTheme } = await import("#themes/themeManager.js");
		const outcome = createTheme("persona").t("ship.outcome", { percent: 20 });

		expect(outcome.image).toMatch(/^https:\/\//);
		expect(outcome.image).toContain("characters");
	});
});
