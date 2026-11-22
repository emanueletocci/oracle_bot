import { describe, it, expect, vi } from "vitest";
import { MessageFlags } from "discord.js";
import { createTheme } from "#themes/themeManager.js";
import slap from "#commands/core/fun/slap.js";

describe("slap — guardie early-return", () => {
	it("self-slap risponde con un messaggio effimero", async () => {
		const reply = vi.fn(async () => {});
		const interaction = {
			user: { id: "u1" },
			options: { getUser: () => ({ id: "u1" }) },
			client: { user: { id: "bot" } },
			reply,
		};

		await slap.execute(interaction, { theme: createTheme("neutral") });

		expect(reply).toHaveBeenCalledTimes(1);
		expect(reply.mock.calls[0][0].flags).toBe(MessageFlags.Ephemeral);
	});

	it("slap al bot risponde con un messaggio effimero", async () => {
		const reply = vi.fn(async () => {});
		const interaction = {
			user: { id: "u1" },
			options: { getUser: () => ({ id: "bot" }) },
			client: { user: { id: "bot" } },
			reply,
		};

		await slap.execute(interaction, { theme: createTheme("neutral") });

		expect(reply).toHaveBeenCalledTimes(1);
		expect(reply.mock.calls[0][0].flags).toBe(MessageFlags.Ephemeral);
	});
});
