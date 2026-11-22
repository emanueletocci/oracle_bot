import { describe, it, expect } from "vitest";
import { generatePhantomText } from "#commands/persona/callingcard.js";

describe("generatePhantomText", () => {
	it("usa la definizione del peccato quando matcha una keyword", () => {
		const text = generatePhantomText("Tizio", "ira");
		expect(text).toContain("vulcano di rabbia");
		expect(text).toContain("Tizio");
		expect(text).toContain("Stanotte, ruberemo il tuo cuore");
	});

	it("il match è case-insensitive", () => {
		expect(generatePhantomText("Tizio", "IRA")).toContain("vulcano di rabbia");
	});

	it("fallback per peccato senza keyword", () => {
		const text = generatePhantomText("Tizio", "xyzzy-inventato");
		expect(text).toContain("Tizio");
		expect(text).toContain("Stanotte, ruberemo il tuo cuore");
		expect(text).not.toContain("vulcano di rabbia");
	});
});
