import { describe, it, expect, vi, afterEach } from "vitest";
import { searchRadioStations, isConfidentMatch } from "#utils/radioSearch.js";
import { resolveQuery, getCandidates, clearCandidates } from "#commands/core/music/radio.js";

const GUILD = "777777777777777777";

function makeClient() {
	return { __radioCandidates: new Map() };
}

function stubStations(stations) {
	const fetchMock = vi.fn(async () => ({ ok: true, json: async () => stations }));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("searchRadioStations", () => {
	it("restituisce stazioni pulite e con stato della risposta", async () => {
		stubStations([
			{ name: "Radio Kiss Kiss", countrycode: "IT", codec: "MP3", bitrate: 128, url_resolved: "http://stream.example/a.mp3" },
			{ name: "Radio X", countrycode: "FR", codec: "AAC", bitrate: 256, url_resolved: "http://stream.example/b" },
		]);

		const stations = await searchRadioStations("kiss kiss");

		expect(stations).toHaveLength(2);
		expect(stations[0]).toMatchObject({
			name: "Radio Kiss Kiss",
			country: "IT",
			codec: "MP3",
			bitrate: 128,
			url: "http://stream.example/a.mp3",
		});
	});

	it("restituisce [] quando non trova nulla", async () => {
		stubStations([]);
		expect(await searchRadioStations("xyz")).toEqual([]);
	});

	it("restituisce [] se l'API fallisce (rete down)", async () => {
		vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network down"); }));
		expect(await searchRadioStations("x")).toEqual([]);
	});
});

describe("isConfidentMatch", () => {
	it("riconosce il nome contenuto nella query (e viceversa)", () => {
		expect(isConfidentMatch("kiss kiss", "Radio Kiss Kiss")).toBe(true);
		expect(isConfidentMatch("Radio Kiss Kiss", "Kiss Kiss")).toBe(true);
	});

	it("ignora maiuscole e accenti", () => {
		expect(isConfidentMatch("città", "Radio Citta")).toBe(true);
	});

	it("non è confidente per query generiche", () => {
		expect(isConfidentMatch("pop", "Radio Kiss Kiss")).toBe(false);
		expect(isConfidentMatch("", "Radio Kiss Kiss")).toBe(false);
	});
});

describe("resolveQuery — flusso unificato di /radio play", () => {
	it("match esatto su una stazione built-in: riproduce subito", async () => {
		const fetchMock = stubStations([]);
		const resolved = await resolveQuery(makeClient(), GUILD, "Lofi Girl");

		expect(resolved.kind).toBe("direct");
		expect(resolved.station.name).toBe("Lofi Girl");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("un solo risultato dal provider: riproduce subito", async () => {
		stubStations([
			{ name: "Radio Kiss Kiss", countrycode: "IT", bitrate: 128, url_resolved: "http://s/1" },
		]);
		const resolved = await resolveQuery(makeClient(), GUILD, "kiss kiss");

		expect(resolved.kind).toBe("direct");
		expect(resolved.station.url).toBe("http://s/1");
	});

	it("più risultati con un match chiaro: riproduce quello", async () => {
		stubStations([
			{ name: "Kiss FM", countrycode: "US", bitrate: 128, url_resolved: "http://s/3" },
			{ name: "Radio Kiss Kiss", countrycode: "IT", bitrate: 128, url_resolved: "http://s/1" },
			{ name: "Virgin Radio", countrycode: "IT", bitrate: 128, url_resolved: "http://s/4" },
		]);
		const resolved = await resolveQuery(makeClient(), GUILD, "kiss kiss");

		expect(resolved.kind).toBe("direct");
		expect(resolved.station.name).toBe("Radio Kiss Kiss");
	});

	it("due match ugualmente chiari: mostra la lista invece di indovinare", async () => {
		stubStations([
			{ name: "Radio Kiss Kiss", countrycode: "IT", bitrate: 128, url_resolved: "http://s/1" },
			{ name: "Radio Kiss Kiss Napoli", countrycode: "IT", bitrate: 128, url_resolved: "http://s/2" },
		]);
		const resolved = await resolveQuery(makeClient(), GUILD, "radio kiss kiss");

		expect(resolved.kind).toBe("list");
		expect(resolved.stations).toHaveLength(2);
	});

	it("più risultati ambigui: restituisce la lista per i bottoni", async () => {
		const client = makeClient();
		stubStations([
			{ name: "Radio Pop 1", countrycode: "IT", bitrate: 128, url_resolved: "http://s/1" },
			{ name: "Pop Hits", countrycode: "US", bitrate: 128, url_resolved: "http://s/2" },
		]);
		const resolved = await resolveQuery(client, GUILD, "pop");

		expect(resolved.kind).toBe("list");
		expect(resolved.stations).toHaveLength(2);
		expect(getCandidates(client, GUILD)?.stations).toHaveLength(2);
	});

	it("nessun risultato: kind none", async () => {
		stubStations([]);
		const resolved = await resolveQuery(makeClient(), GUILD, "zzzz");
		expect(resolved.kind).toBe("none");
	});

	it("riusa i risultati in cache per la stessa query (nessuna seconda fetch)", async () => {
		const client = makeClient();
		const fetchMock = stubStations([
			{ name: "Radio Pop 1", countrycode: "IT", bitrate: 128, url_resolved: "http://s/1" },
			{ name: "Pop Hits", countrycode: "US", bitrate: 128, url_resolved: "http://s/2" },
		]);

		await resolveQuery(client, GUILD, "pop");
		const second = await resolveQuery(client, GUILD, "pop");

		expect(second.kind).toBe("list");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("la cache scade e viene scartata", async () => {
		const client = makeClient();
		stubStations([
			{ name: "Radio Pop 1", countrycode: "IT", bitrate: 128, url_resolved: "http://s/1" },
			{ name: "Pop Hits", countrycode: "US", bitrate: 128, url_resolved: "http://s/2" },
		]);
		await resolveQuery(client, GUILD, "pop");

		// simulate an expired entry
		client.__radioCandidates.get(GUILD).expiresAt = Date.now() - 1;

		expect(getCandidates(client, GUILD)).toBeNull();
		clearCandidates(client, GUILD);
	});
});
