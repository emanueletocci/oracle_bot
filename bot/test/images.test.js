import { describe, it, expect } from "vitest";
import { isRemoteUrl } from "#utils/images.js";

describe("isRemoteUrl", () => {
	it("riconosce URL http/https", () => {
		expect(isRemoteUrl("https://cdn.example.com/coin.webp")).toBe(true);
		expect(isRemoteUrl("http://example.com/x.png")).toBe(true);
	});

	it("rifiuta percorsi locali, attachment e non-stringhe", () => {
		expect(isRemoteUrl("/local/coin.webp")).toBe(false);
		expect(isRemoteUrl("attachment://coin.webp")).toBe(false);
		expect(isRemoteUrl("")).toBe(false);
		expect(isRemoteUrl(null)).toBe(false);
		expect(isRemoteUrl(undefined)).toBe(false);
	});
});
