import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveSongQuery } from "#utils/musicSearch.js";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("resolveSongQuery", () => {
	it("lascia passare gli URL senza risolverli", async () => {
		const result = await resolveSongQuery("https://youtu.be/abc123");
		expect(result.query).toBe("https://youtu.be/abc123");
		expect(result.title).toBeNull();
		expect(result.duration).toBeNull();
	});

	it("risolve una query testuale in Artista - Titolo + durata", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				json: async () => ({
					results: [
						{
							trackName: "Smells Like Teen Spirit",
							artistName: "Nirvana",
							trackTimeMillis: 301000,
						},
					],
				}),
			})),
		);

		const result = await resolveSongQuery("smells like teen spirit");
		expect(result.query).toBe("Nirvana - Smells Like Teen Spirit");
		expect(result.title).toBe("Smells Like Teen Spirit");
		expect(result.artist).toBe("Nirvana");
		expect(result.duration).toBe("5:01");
	});

	it("fallback alla query originale se iTunes fallisce", async () => {
		vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));

		const result = await resolveSongQuery("qualcosa");
		expect(result.query).toBe("qualcosa");
		expect(result.title).toBeNull();
		expect(result.duration).toBeNull();
	});
});
