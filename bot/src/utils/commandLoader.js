// Loads every slash command under src/commands, recursively.
// The first folder below "commands" is the command's module:
//   commands/core/...    → "core"    (always available)
//   commands/persona/... → "persona" (only when the guild uses the Persona theme)
//   commands/dev/...     → "dev"     (registered only in the development guild)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import logger from "#utils/logger.js";
import { COMMANDS_DIR } from "#utils/paths.js";
export const MODULES = ["core", "persona", "dev"];

function listCommandFiles(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	return entries.flatMap((entry) => {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) return listCommandFiles(fullPath);
		return entry.name.endsWith(".js") ? [fullPath] : [];
	});
}

// Imports a single command file. Pass bustCache = true to force a fresh
// import (used by /reload, since ESM has no require.cache).
export async function importCommand(filePath, { bustCache = false } = {}) {
	const url = pathToFileURL(filePath).href + (bustCache ? `?update=${Date.now()}` : "");
	const imported = await import(url);
	const command = imported.default || imported;

	if (!("data" in command) || !("execute" in command)) {
		logger.warn(`Command module is missing required "data" or "execute" property: ${filePath}`);
		return null;
	}

	const moduleName = path.relative(COMMANDS_DIR, filePath).split(path.sep)[0];
	if (!MODULES.includes(moduleName)) {
		logger.warn(`Command ${filePath} is outside a known module (${MODULES.join(", ")}). Skipped.`);
		return null;
	}

	command.module = moduleName;
	command.filePath = filePath;
	return command;
}

export async function loadCommands() {
	const commands = [];

	for (const filePath of listCommandFiles(COMMANDS_DIR)) {
		const command = await importCommand(filePath);
		if (command) commands.push(command);
	}

	return commands;
}
