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
		arcanaLabel: "Arcano",
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
		musicActive: "⚠️ La musica sta usando il canale vocale. Usa `/music stop` prima di gestire la radio.",
		started: ({ member }) => `🎶 **${member}**, la radio lofi è partita. Rilassati!`,
		fileMissing: "❌ File audio della radio non trovato.",
		notConnected: "❌ Il bot non è connesso a nessun canale vocale.",
		stopped: "🛑 **Radio spenta.**",
	},

	music: {
		notInVoice: "🎧 Entra in un canale vocale per ascoltare la musica!",
		lofiActive: "⚠️ La radio lofi sta usando il canale vocale. Usa `/lofi stop` per fermarla prima di avviare la musica.",
		loading: ({ query }) => `🔎 Caricamento in corso: **${query}**...`,
		queued: ({ query }) => `✅ Aggiunto alla coda: **${query}**`,
		queuedWithMeta: ({ title, artist, duration }) => `✅ Aggiunto alla coda: **${title}** — ${artist} · \`${duration}\``,
		notFound: "❌ Impossibile trovare la traccia.",
		leftChannel: "👋 Ho lasciato il canale vocale.",
		nothingPlaying: "Non c'è nessuna riproduzione in corso.",
		stopped: "⏹️ Riproduzione interrotta. Ho lasciato il canale vocale.",
		nowPlaying: ({ name, duration }) => `🎵 In riproduzione: \`${name}\` - \`${duration}\``,
		skipped: ({ name }) => `⏭️ Saltata: **${name}**`,
		paused: "⏸️ Riproduzione in pausa.",
		resumed: "▶️ Riproduzione ripresa.",
		volumeSet: ({ volume }) => `🔊 Volume impostato al **${volume}%**.`,
		volumeInvalid: "❌ Il volume deve essere compreso tra 0 e 100.",
		loopOff: "🔁 Loop disattivato.",
		loopQueue: "🔁 Loop attivo su tutta la coda.",
		loopSong: "🔁 Loop attivo sul brano corrente.",
		shuffleOn: "🔀 Coda mescolata.",
		shuffleOff: "🔀 Shuffle disattivato.",
		seekDone: ({ seconds }) => `⏩ Salto a **${seconds}s**.`,
		removed: ({ name }) => `🗑️ Rimosso dalla coda: **${name}**`,
		removeInvalid: "❌ Posizione non valida nella coda.",
		joined: ({ channel }) => `🎧 Mi sono unito a **${channel}**.`,
		queueTitle: "🎵 Coda di riproduzione",
		queueNow: ({ name }) => `▶️ In riproduzione: **${name}**`,
		error: ({ message }) => `❌ Errore di riproduzione: ${message}`,
		criticalError: "❌ Errore critico. I dettagli tecnici sono stati salvati nei log.",
	},

	welcome: {
		message: ({ member }) => `Benvenuto nel server, ${member}! 🎉`,
	},

	radio: {
		notInVoice: "🎧 Entra in un canale vocale per ascoltare la radio!",
		alreadyMusic: "⚠️ La musica sta usando il canale vocale. Ferma la musica con `/music stop` prima di avviare la radio.",
		alreadyPlaying: "⚠️ La radio è già in riproduzione.",
		started: ({ member, station }) => `📻 **${member}**, radio avviata: **${station}**. Goditi lo streaming!`,
		stopped: "🛑 **Radio spenta.**",
		saved: ({ station }) => `✅ Stazione salvata con nome **${station}**.`,
		listTitle: "📻 Stazioni radio",
		listActive: ({ station }) => `In riproduzione: **${station}**`,
		listNone: "Nessuna stazione in riproduzione.",
		listSavedTitle: "Salvate nel server:",
		listFooter: "Usa `/radio play <nome>` per avviarne una.",
		notFound: "❌ Stazione non trovata. Usa `/radio list` per le disponibili.",
		searchNoResults: ({ query }) =>
			`❌ Nessuna stazione trovata per **${query}**. Prova con un altro nome.`,
		searchTitle: ({ query }) => `📻 Risultati per “${query}”`,
		searchEntry: ({ name, country, bitrate }) => `• **${name}**${country ? ` (${country})` : ""}${bitrate ? ` · \`${bitrate}kbps\`` : ""}`,
		selectFooter: "Clicca il bottone con il numero della stazione da riprodurre",
		selectionExpired: "❌ Questa lista è scaduta: usa di nuovo `/radio play <nome>`.",
		invalidUrl: "❌ URL non valido: serve un indirizzo http(s) diretto allo stream.",
		noSaved: "❌ Nessuna stazione salvata in questo server.",
		noPermission: "❌ Ti servono i permessi di amministrazione per questa azione.",
		removed: ({ station }) => `🗑️ Stazione **${station}** rimossa.`,
		streamError: "❌ Impossibile connettersi allo stream della stazione.",
		musicActive: "⚠️ La musica sta usando il canale vocale. Fermala con `/music stop`.",
		notReady: "❌ La connessione audio non è pronta. Riprova.",
	},

	theme: {
		listTitle: "🎨 Temi disponibili",
		listActive: ({ current }) => `Tema attivo in questo server: **${current}**`,
		listAvailable: ({ list }) => `Disponibili: ${list}`,
		setDone: ({ name }) => `✅ Tema aggiornato: **${name}**`,
		resetDone: ({ name }) => `✅ Tema ripristinato al predefinito: **${name}**`,
		invalid: "❌ Questo tema non esiste. Usa `/theme list` per vederli tutti.",
	},

	avatar: {
		title: ({ user }) => `🖼️ Avatar di ${user}`,
	},

	banner: {
		title: ({ user }) => `🖼️ Banner di ${user}`,
		none: "❌ Questo utente non ha un banner.",
	},

	emoji: {
		title: ({ name }) => `Emoji: ${name}`,
		id: ({ id }) => `ID: \`${id}\``,
		invalid: "❌ Emoji non riconosciuto.",
	},

	ping: {
		calculating: "🏓 Misurazione in corso...",
		gateway: ({ ms }) => `🌐 Latenza gateway: **${ms}ms**`,
		roundtrip: ({ ms }) => `🔄 Round-trip interazione: **${ms}ms**`,
	},

	uptime: {
		title: "⏱️ Uptime del bot",
	},

	stats: {
		title: "📊 Statistiche",
		guildsLabel: "🌐 Server",
		usersLabel: "👥 Utenti",
		commandsLabel: "📜 Comandi",
		uptimeLabel: "⏱️ Uptime",
		memoryLabel: "🧠 Memoria",
	},

	serverinfo: {
		title: ({ name }) => `ℹ️ ${name}`,
		ownerLabel: "👑 Proprietario",
		membersLabel: "👥 Membri",
		boostsLabel: "🚀 Boost",
		channelsLabel: "📁 Canali",
		rolesLabel: "🎭 Ruoli",
		createdLabel: "📅 Creato il",
		idLabel: "🆔 ID",
	},

	roleinfo: {
		title: ({ role }) => `ℹ️ Ruolo: ${role}`,
		colorLabel: "🎨 Colore",
		membersLabel: "👥 Membri",
		positionLabel: "📊 Posizione",
		mentionableLabel: "📣 Menzionabile",
		hoistedLabel: "📌 Separato",
		createdLabel: "📅 Creato il",
		idLabel: "🆔 ID",
	},

	role: {
		added: ({ role, user }) => `✅ Ruolo **${role}** assegnato a **${user}**.`,
		removed: ({ role, user }) => `✅ Ruolo **${role}** rimosso da **${user}**.`,
		notFound: "❌ Ruolo non trovato.",
		memberNotFound: "❌ Utente non presente nel server.",
		tooHigh: "❌ Non posso gestire questo ruolo: è sopra il mio ruolo massimo.",
	},
};
