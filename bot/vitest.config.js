import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	// Mirror the subpath imports from package.json, so tests can use the same
	// `#alias` imports as the bot source.
	resolve: {
		alias: {
			"#config": path.join(root, "config.json"),
			"#commands": path.join(root, "src/commands"),
			"#data": path.join(root, "src/data"),
			"#database": path.join(root, "src/database"),
			"#events": path.join(root, "src/events"),
			"#settings": path.join(root, "src/settings"),
			"#themes": path.join(root, "src/themes"),
			"#utils": path.join(root, "src/utils"),
		},
	},
	test: {
		environment: "node",
		include: ["test/**/*.test.js"],
		setupFiles: ["./test/setup.js"],
	},
});
