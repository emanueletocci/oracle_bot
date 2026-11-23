import http from "node:http";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { REST } from "@discordjs/rest";
import { Agent, setGlobalDispatcher } from "undici";

// Regression test for file uploads (/slap, welcome images).
//
// Several dependencies ship different undici copies (6 for @discordjs/rest,
// 8 for ytdl-core) and they all share the global dispatcher stored under
// Symbol.for("undici.globalDispatcher.1"). When the newer copy creates it,
// REST dispatches through undici 8, which rejects Node's global FormData:
// "body must be a FormData created by this undici package instance".
//
// The bot passes `makeRequest: fetch` to its REST options, so the request and
// the FormData come from the same implementation. This test reproduces the
// polluted dispatcher and checks that an attachment still goes through.

const DISPATCHER_SYMBOL = Symbol.for("undici.globalDispatcher.1");

let server;
let api;
let previousDispatcher;

beforeAll(async () => {
	server = http.createServer((req, res) => {
		let bytes = 0;
		req.on("data", (chunk) => {
			bytes += chunk.length;
		});
		req.on("end", () => {
			res.writeHead(200, { "content-type": "application/json" });
			res.end(JSON.stringify({ ok: true, bytes, contentType: req.headers["content-type"] }));
		});
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	api = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
	globalThis[DISPATCHER_SYMBOL] = previousDispatcher;
	await new Promise((resolve) => server.close(resolve));
});

describe("REST uploads con dispatcher undici inquinato", () => {
	it("invia un attachment anche se il dispatcher globale è di undici 8", async () => {
		previousDispatcher = globalThis[DISPATCHER_SYMBOL];
		// Simulate what ytdl-core/distube do when they touch undici first.
		setGlobalDispatcher(new Agent());

		const rest = new REST({
			version: "10",
			api,
			retries: 1,
			timeout: 15_000,
			makeRequest: fetch,
		}).setToken("fake-token");

		const result = await rest.post("/upload", {
			files: [{ name: "slap.gif", data: Buffer.from("GIF89a") }],
			body: { content: "hi" },
		});

		expect(result.ok).toBe(true);
		expect(result.bytes).toBeGreaterThan(0);
		expect(result.contentType).toContain("multipart/form-data");
	});
});
