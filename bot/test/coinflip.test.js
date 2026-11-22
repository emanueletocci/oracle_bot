import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import coinflip from "#commands/core/fun/coinflip.js";

// Un tema finto permette di controllare il valore di `image` senza dipendere
// dai temi reali né dal risultato (casuale) della moneta: testa e croce
// restituiscono la stessa immagine.
function makeTheme(image) {
	return {
		t: (key) => {
			if (key === "coinflip.pending") return null;
			if (key === "coinflip.heads" || key === "coinflip.tails") {
				return { title: "T", description: "D", color: "#ffffff", image };
			}
			return null;
		},
	};
}

function makeInteraction() {
	return {
		user: { id: "u1" },
		reply: vi.fn(async () => {}),
		editReply: vi.fn(async () => {}),
	};
}

describe("coinflip — gestione immagine", () => {
	it("URL remoto → thumbnail via URL, nessun file", async () => {
		const interaction = makeInteraction();
		await coinflip.execute(interaction, {
			theme: makeTheme("https://cdn.example.com/coin.webp"),
		});

		const payload = interaction.reply.mock.calls[0][0];
		expect(payload.files).toEqual([]);
		expect(payload.embeds[0].data.thumbnail.url).toBe("https://cdn.example.com/coin.webp");
	});

	it("file locale esistente → attachment", async () => {
		const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oracle-img-"));
		const imagePath = path.join(tmp, "coin.webp");
		fs.writeFileSync(imagePath, "fake");

		const interaction = makeInteraction();
		await coinflip.execute(interaction, { theme: makeTheme(imagePath) });

		const payload = interaction.reply.mock.calls[0][0];
		expect(payload.files).toHaveLength(1);
		expect(payload.embeds[0].data.thumbnail.url).toBe("attachment://coin.webp");
	});

	it("file mancante → nessun file, nessuna thumbnail", async () => {
		const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oracle-img-"));
		const interaction = makeInteraction();
		await coinflip.execute(interaction, {
			theme: makeTheme(path.join(tmp, "nope.webp")),
		});

		const payload = interaction.reply.mock.calls[0][0];
		expect(payload.files).toEqual([]);
		expect(payload.embeds[0].data.thumbnail).toBeUndefined();
	});
});
