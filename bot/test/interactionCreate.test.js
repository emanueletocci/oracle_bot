import { describe, it, expect, vi, beforeEach } from "vitest";
import { Collection, MessageFlags } from "discord.js";
import { setGuildTheme } from "#settings/guildSettings.js";
import interactionCreate from "#events/interactionCreateEvent.js";

const GUILD = "888888888888888888";

function makeClient(command) {
	return {
		commands: new Collection([[command.data.name, command]]),
		cooldowns: new Collection(),
	};
}

function makeInteraction(commandName, client, userId = "user1") {
	return {
		isChatInputCommand: () => true,
		commandName,
		client,
		guildId: GUILD,
		user: { id: userId },
		reply: vi.fn(async () => {}),
		editReply: vi.fn(async () => {}),
		followUp: vi.fn(async () => {}),
		replied: false,
		deferred: false,
	};
}

describe("interactionCreate — gating del tema", () => {
	beforeEach(() => setGuildTheme(GUILD, "neutral"));

	it("blocca i comandi persona quando il tema è neutral", async () => {
		const command = {
			module: "persona",
			data: { name: "callingcard" },
			execute: vi.fn(async () => {}),
		};
		const client = makeClient(command);
		const interaction = makeInteraction("callingcard", client);

		await interactionCreate.execute(interaction);

		expect(command.execute).not.toHaveBeenCalled();
		expect(interaction.reply).toHaveBeenCalledTimes(1);
		const arg = interaction.reply.mock.calls[0][0];
		expect(arg.flags).toBe(MessageFlags.Ephemeral);
		expect(arg.content).toContain("Persona");
	});

	it("esegue i comandi persona quando il tema è persona", async () => {
		setGuildTheme(GUILD, "persona");
		const command = {
			module: "persona",
			data: { name: "callingcard" },
			execute: vi.fn(async () => {}),
		};
		const client = makeClient(command);
		const interaction = makeInteraction("callingcard", client);

		await interactionCreate.execute(interaction);

		expect(command.execute).toHaveBeenCalledTimes(1);
	});
});

describe("interactionCreate — cooldown", () => {
	it("applica un cooldown per utente", async () => {
		vi.useFakeTimers();
		try {
			const command = {
				module: "core",
				data: { name: "ping" },
				cooldown: 3,
				execute: vi.fn(async () => {}),
			};
			const client = makeClient(command);
			const interaction = makeInteraction("ping", client);

			await interactionCreate.execute(interaction);
			await interactionCreate.execute(interaction);

			expect(command.execute).toHaveBeenCalledTimes(1);
			expect(interaction.reply).toHaveBeenCalledTimes(1);
			expect(interaction.reply.mock.calls[0][0].content).toContain("cooldown");
		} finally {
			vi.useRealTimers();
		}
	});
});
