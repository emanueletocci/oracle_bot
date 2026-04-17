export default {
	name: "error",
	distube: true,
	execute(...args) {
		let errorObj = null;
		let targetChannel = null;

		// Ispezioniamo tutti i parametri che DisTube ci ha lanciato
		for (const arg of args) {
			if (arg instanceof Error) {
				// Abbiamo trovato l'oggetto errore
				errorObj = arg;
			} else if (arg && typeof arg.send === "function") {
				// Abbiamo trovato il canale testuale
				targetChannel = arg;
			} else if (
				arg &&
				arg.textChannel &&
				typeof arg.textChannel.send === "function"
			) {
				// Abbiamo trovato la coda, estraiamo il canale al suo interno
				targetChannel = arg.textChannel;
			}
		}

		// Estraiamo il testo dell'errore (o mettiamo un testo di default se introvabile)
		const errorTesto =
			errorObj?.message ||
			String(errorObj || args[0] || "Anomalia sconosciuta");

		let messaggioDiscord = `❌ Errore durante l'assalto: ${errorTesto}`;

		// Protezione anti-crash per il limite caratteri di Discord (2000 caratteri max)
		if (messaggioDiscord.length > 1950) {
			messaggioDiscord =
				"❌ Errore critico! Il log cognitivo è troppo denso. Dettagli salvati nel terminale.";
		}

		// Se abbiamo scovato un canale valido, mandiamo l'avviso lì
		if (targetChannel) {
			targetChannel.send(messaggioDiscord).catch(console.error);
		} else {
			// Altrimenti, stampiamo l'errore in rosso nel terminale senza far crashare il bot
			console.error(
				"❌ Errore nel Metaverso (Nessun canale disponibile):",
				errorObj || args,
			);
		}
	},
};
