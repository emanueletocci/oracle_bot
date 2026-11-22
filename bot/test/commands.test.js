import { describe, it, expect, vi } from "vitest";
import { MessageFlags } from "discord.js";
import { createTheme } from "#themes/themeManager.js";
import { withTimeout } from "#events/interactionCreateEvent.js";
import { loadCommands } from "#utils/commandLoader.js";
import ship from "#commands/core/fun/ship.js";

describe("withTimeout", () => {
	it("risolve quando il promise si chiude in tempo", async () => {
		await expect(withTimeout(Promise.resolve("ok"))).resolves.toBe("ok");
	});

	it("rigetta con un errore di timeout se il promise non si chiude", async () => {
		vi.useFakeTimers();
		try {
			const never = new Promise(() => {});
			const assertion = expect(withTimeout(never)).rejects.toThrow(/Timed out/);
			vi.advanceTimersByTime(61_000);
			await assertion;
		} finally {
			vi.useRealTimers();
		}
	});
});

describe("ship — guardie early-return", () => {
	it("self-ship risponde con un messaggio effimero", async () => {
		const reply = vi.fn(async () => {});
		const interaction = {
			options: { getUser: () => ({ id: "u1" }) },
			user: { id: "u1" },
			client: { user: { id: "bot" } },
			reply,
		};

		await ship.execute(interaction, { theme: createTheme("neutral") });

		expect(reply).toHaveBeenCalledTimes(1);
		expect(reply.mock.calls[0][0].flags).toBe(MessageFlags.Ephemeral);
	});

	it("bot-ship risponde senza calcolare il risultato", async () => {
		const reply = vi.fn(async () => {});
		const interaction = {
			options: { getUser: (name) => (name === "utente1" ? { id: "u1" } : { id: "bot" }) },
			user: { id: "u1" },
			client: { user: { id: "bot" } },
			reply,
		};

		await ship.execute(interaction, { theme: createTheme("neutral") });

		expect(reply).toHaveBeenCalledTimes(1);
	});
});

describe("loadCommands — smoke test", () => {
	it("carica tutti i comandi, ognuno con data + execute + module valido", async () => {
		const commands = await loadCommands();
		const names = commands.map((command) => command.data.name);

		[
			"coinflip", "ship", "roll", "slap",
			"ban", "kick", "unban", "banlist",
			"lofi", "music",
			"clean", "help", "info", "theme",
			"callingcard", "fusion", "tarot",
			"reload", "testwelcome",
		].forEach((name) => expect(names).toContain(name));

		for (const command of commands) {
			expect(typeof command.execute).toBe("function");
			expect(["core", "persona", "dev"]).toContain(command.module);
		}
	});
});
