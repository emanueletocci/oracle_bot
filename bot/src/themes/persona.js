// Persona 5 Royal theme: overrides only the keys it wants to change.
// Anything missing here falls back to neutral.js.
import path from "node:path";
import colors from "#data/colors.js";
import chars from "#data/characters.js";
import { CHARACTERS_DIR, COINS_DIR, IMAGES_DIR } from "#utils/paths.js";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Turns a character from data/characters.js into a ship outcome
const fromChar = (char, message) => ({
	message,
	arcana: char.arcana,
	emoji: char.emoji,
	color: char.color,
	image: path.join(CHARACTERS_DIR, char.image),
});

export default {
	color: colors.p5_red,

	errors: {
		personaOnly:
			"🎭 Questo comando appartiene al Metaverso: il tema Persona non è attivo in questo server.",
	},

	coinflip: {
		pending: ({ user }) => `😼 ${user}! Tieni pronto il coltello, percepisco qualcosa...`,
		heads: {
			title: "🎭 PHANTOM THIEVES WIN! - TESTA",
			description: "**The show's over.**\nIl nemico è stato annientato con stile. Vittoria perfetta.",
			color: colors.p5_red,
			image: path.join(COINS_DIR, "coinJoker.png"),
		},
		tails: {
			title: "💀 SHADOWS WIN! - CROCE",
			description: "**Senti il rumore di catene...**\nIl Mietitore ti ha trovato. Non c'è via di fuga. *Despair.*",
			color: colors.shadow_purple,
			image: path.join(COINS_DIR, "coinShadow.png"),
		},
	},

	ship: {
		title: "🎭 CONFIDANT ASSESSMENT",
		affinityLabel: "Affinità",
		rankLabel: "Social Link Rank",
		arcanaLabel: "Arcano",
		footer: "Take Your Heart ❤️‍🩹",
		selfShip: ({ user }) => `😼 Ehi ${user}! Smettila di guardarti allo specchio! (Narcisismo: 100%)`,
		botShip: ({ bot }) => `😼 Ehi ${bot}! Niente distrazioni, devi andare a dormire!`,
		outcome: ({ percent }) => {
			if (percent === 0) return fromChar(chars.igor, "⚰️ Il vuoto cosmico. Nemmeno Arsène può rubare questo cuore, perché non c'è.");
			if (percent === 69) return fromChar(chars.skull, "💀 For real?! Che numero assurdo!");
			if (percent === 77) return fromChar(chars.chihaya, "🔮 **Jackpot!** Le carte prevedono una fortuna sfacciata tra voi due!");
			if (percent === 99) {
				return {
					message: "🃏 **Take Your Heart!** Manca solo l'1%... serve solo inviare la Lettera di Sfida!",
					arcana: "THE JOLLY",
					emoji: "🃏",
					color: colors.p5_red,
					image: path.join(IMAGES_DIR, "callingCard.png"),
				};
			}
			if (percent < 15) return fromChar(chars.takemi, "💉 Questa relazione è tossica. Vi serve una visita medica urgente.");
			if (percent < 35) return fromChar(chars.mona, "🐱 Ehi... credo che tu sia nella Friendzone, proprio come me con Lady Ann.");
			if (percent < 55) return fromChar(chars.crow, "⚖️ Vi odiate o vi amate? C'è una strana tensione... una rivalità mortale.");
			if (percent < 70) return fromChar(chars.ohya, "🍸 È una relazione complicata e adulta. Forse dovreste parlarne davanti a un drink.");
			if (percent < 85) return fromChar(chars.panther, "🤝 Un legame indissolubile! Siete pronti per i Memento.");
			return fromChar(chars.lavenza, "🦋 Io sono te, tu sei me... Hai trasformato una promessa in un patto di sangue.");
		},
	},

	slap: {
		self: "Non puoi attaccarti da solo!",
		quote: ({ sender, target }) => pick([
			`**${sender}** e il suo Persona annientano **${target}**! 🎭☠️`,
			`**${sender}** usa una Showtime su **${target}**: *It's showtime!* 🎬💥`,
			`**${sender}** ha scatenato un All-Out Attack su **${target}**! 💨💀`,
			`**${sender}** strappa la maschera a **${target}**: *"Show me your true form!"* 👺🔥`,
		]),
	},

	lofi: {
		notInVoice: "⛓️ **Detenuto!** Che insolenza... Cerchi di ascoltare la musica senza essere in cella? Entra subito in vocale!",
		alreadyPlaying: "⚠️⛓️ Detenuto! Non vedi che la radio è già attiva? Usa `/lofi stop` se vuoi fermarla.",
		started: ({ member }) => `🐱 **Ehi ${member}!** Basta combattere per oggi. Ascolta questa Lofi e rilassati!`,
		notConnected: "❌⛓️ **Detenuto!** Che insolenza... Non vedi che il bot non è connesso a nessun canale vocale?",
		stopped: "🛑 **Radio spenta.** Il bot è tornato al Leblanc.",
	},

	music: {
		notInVoice: "🎧 Bzz... Segnale debole, Joker! Non posso trasmettere la traccia se non ti connetti. Infiltrati in un canale vocale!",
		loading: ({ query }) => `Caricamento in corso per: **${query}**... 🎧`,
		queued: ({ query }) => `Rotta calcolata per: **${query}**! Preparazione all'assalto. 🎩`,
		notFound: "❌ Impossibile trovare la traccia. I server cognitivi fanno resistenza!",
		leftChannel: "Ritiro strategico! Il bot ha lasciato il canale. 💨",
		nothingPlaying: "Non c'è nessuna missione in corso in questo momento!",
		stopped: "Missione annullata. Ritiro strategico dal canale vocale! Il bot è tornato al Leblanc. 💨",
		nowPlaying: ({ name, duration }) => `🎵 **Take Over!** Infiltrazione riuscita. In riproduzione: \`${name}\` - \`${duration}\``,
		error: ({ message }) => `❌ Errore durante l'assalto: ${message}`,
	},
};
