import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@discordjs/voice", () => ({
	getVoiceConnection: vi.fn(),
}));

import * as voice from "@discordjs/voice";
import { isMusicActive, isLofiActive } from "#utils/audioState.js";

function fakeGuild({ music = false } = {}) {
	return {
		id: "guild-1",
		client: {
			distube: {
				voices: music ? new Map([["guild-1", {}]]) : new Map(),
			},
		},
	};
}

beforeEach(() => {
	voice.getVoiceConnection.mockReset();
});

describe("audioState — arbitraggio lofi/musica", () => {
	it("isMusicActive: true quando DisTube ha una coda per la guild", () => {
		expect(isMusicActive(fakeGuild({ music: true }))).toBe(true);
	});

	it("isMusicActive: false senza coda", () => {
		expect(isMusicActive(fakeGuild())).toBe(false);
	});

	it("isLofiActive: true con connessione vocale e nessuna musica", () => {
		voice.getVoiceConnection.mockReturnValue({});
		expect(isLofiActive(fakeGuild())).toBe(true);
	});

	it("isLofiActive: false quando la musica è attiva (anche con connessione)", () => {
		voice.getVoiceConnection.mockReturnValue({});
		expect(isLofiActive(fakeGuild({ music: true }))).toBe(false);
	});

	it("isLofiActive: false senza connessione vocale", () => {
		voice.getVoiceConnection.mockReturnValue(undefined);
		expect(isLofiActive(fakeGuild())).toBe(false);
	});
});
