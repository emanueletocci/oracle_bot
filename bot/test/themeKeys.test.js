import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { COMMANDS_DIR, EVENTS_DIR } from "#utils/paths.js";
import { createTheme } from "#themes/themeManager.js";

// Raccoglie ricorsivamente i file .js di una cartella
function collectJsFiles(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) return collectJsFiles(fullPath);
		return entry.name.endsWith(".js") ? [fullPath] : [];
	});
}

// Estrae tutte le chiavi "a.b.c" usate nelle chiamate theme.t("chiave").
// Gestisce sia le stringhe dirette sia i ternari (es. isHeads ? "a.b" : "c.d").
function extractKeys(source) {
	const keys = new Set();
	const callRegex = /theme\.t\(([^()]*)\)/g;
	let match;
	while ((match = callRegex.exec(source))) {
		const stringRegex = /["'`]([a-zA-Z0-9_.]+)["'`]/g;
		let stringMatch;
		while ((stringMatch = stringRegex.exec(match[1]))) {
			if (stringMatch[1].includes(".")) keys.add(stringMatch[1]);
		}
	}
	return keys;
}

describe("key-completeness: ogni chiave usata esiste in neutral", () => {
	it("nessuna theme.t() punta a una chiave mancante", () => {
		const neutral = createTheme("neutral");
		const files = [...collectJsFiles(COMMANDS_DIR), ...collectJsFiles(EVENTS_DIR)];

		const missing = [];
		for (const file of files) {
			const source = fs.readFileSync(file, "utf8");
			for (const key of extractKeys(source)) {
				// t() restituisce la chiave stessa quando non risolve da nessuna parte
				if (neutral.t(key) === key) {
					missing.push(`${key} → ${path.relative(process.cwd(), file)}`);
				}
			}
		}

		expect(missing).toEqual([]);
	});
});
