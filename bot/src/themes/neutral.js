// Neutral theme: the complete set of texts. Every key used by the bot must
// exist here, because other themes fall back to it.
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
	color: "#5865F2",

	errors: {
		generic: "Si è verificato un errore durante l'esecuzione del comando.",
		personaOnly:
			"Questo comando fa parte del tema Persona, che non è attivo in questo server.",
	},

	help: {
		title: "📚 Lista comandi",
		description: "Ecco tutti i comandi che puoi usare:",
		noDescription: "Nessuna descrizione",
	},

	coinflip: {
		pending: null,
		heads: {
			title: "🪙 Testa!",
			description: "La moneta è caduta su **testa**.",
			color: "#F7C325",
			image: null,
		},
		tails: {
			title: "🪙 Croce!",
			description: "La moneta è caduta su **croce**.",
			color: "#9B9B9B",
			image: null,
		},
	},

	ship: {
		title: "💞 Test di affinità",
		affinityLabel: "Affinità",
		rankLabel: "Valutazione",
		footer: "Solo per divertimento ❤️",
		selfShip: ({ user }) => `${user}, l'amore per sé stessi è importante, ma serve una seconda persona!`,
		botShip: ({ bot }) => `${bot} è un bot: il suo cuore è fatto di codice.`,
		outcome: ({ percent }) => {
			if (percent === 0) return { message: "🧊 Nessuna affinità. Proprio nessuna." };
			if (percent < 15) return { message: "💔 Meglio restare semplici conoscenti." };
			if (percent < 35) return { message: "🙂 Una buona amicizia, niente di più." };
			if (percent < 55) return { message: "⚖️ C'è una strana tensione tra voi..." };
			if (percent < 70) return { message: "☕ Potrebbe funzionare, parlatene davanti a un caffè." };
			if (percent < 85) return { message: "🤝 Un legame davvero forte!" };
			if (percent < 100) return { message: "💖 Siete fatti l'uno per l'altra!" };
			return { message: "💍 Affinità perfetta. Fissate la data!" };
		},
	},

	slap: {
		self: "Non puoi colpire te stesso!",
		bot: "Non puoi colpire me!",
		missingFolder: "❌ **Errore di configurazione:** la cartella `assets/gif/slaps` non esiste.",
		emptyFolder: "❌ La cartella `assets/gif/slaps` è vuota! Aggiungi qualche GIF.",
		readError: "Si è verificato un errore durante la lettura dei file.",
		quote: ({ sender, target }) => pick([
			`**${sender}** ha dato uno schiaffo a **${target}**! 👋`,
			`**${sender}** colpisce **${target}** in pieno! 💥`,
			`**${target}** non se l'aspettava: **${sender}** ha colpito! 😵`,
		]),
	},

	lofi: {
		notInVoice: "🎧 Entra in un canale vocale per ascoltare la radio!",
		alreadyPlaying: "⚠️ La radio è già attiva. Usa `/lofi stop` per fermarla.",
		started: ({ member }) => `🎶 **${member}**, la radio lofi è partita. Rilassati!`,
		fileMissing: "❌ File audio della radio non trovato.",
		notConnected: "❌ Il bot non è connesso a nessun canale vocale.",
		stopped: "🛑 **Radio spenta.**",
	},

	music: {
		notInVoice: "🎧 Entra in un canale vocale per ascoltare la musica!",
		loading: ({ query }) => `🔎 Caricamento in corso: **${query}**...`,
		queued: ({ query }) => `✅ Aggiunto alla coda: **${query}**`,
		notFound: "❌ Impossibile trovare la traccia.",
		leftChannel: "👋 Ho lasciato il canale vocale.",
		nothingPlaying: "Non c'è nessuna riproduzione in corso.",
		stopped: "⏹️ Riproduzione interrotta. Ho lasciato il canale vocale.",
		nowPlaying: ({ name, duration }) => `🎵 In riproduzione: \`${name}\` - \`${duration}\``,
		error: ({ message }) => `❌ Errore di riproduzione: ${message}`,
		criticalError: "❌ Errore critico. I dettagli tecnici sono stati salvati nei log.",
	},
};
