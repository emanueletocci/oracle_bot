import { describe, it, expect } from "vitest";
import { renderLog } from "#utils/logger.js";

describe("renderLog — formato di una riga di log", () => {
	it("mantiene sia il messaggio sia lo stack (regressione: stack || message)", () => {
		const line = renderLog({
			level: "error",
			message: "[abc12345] /coinflip failed after 30000ms",
			timestamp: "2026-11-23 00:00:00",
			stack: "Error: This operation was aborted\n    at ...",
		});

		expect(line).toContain("[abc12345] /coinflip failed after 30000ms");
		expect(line).toContain("Error: This operation was aborted");
	});

	it("senza stack stampa solo il messaggio", () => {
		const line = renderLog({
			level: "info",
			message: "Client ready",
			timestamp: "2026-11-23 00:00:00",
		});

		expect(line).toContain("Client ready");
		expect(line).not.toContain("\n");
	});
});
