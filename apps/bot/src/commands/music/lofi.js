import { SlashCommandBuilder } from "discord.js";
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	NoSubscriberBehavior,
	getVoiceConnection,
} from "@discordjs/voice";
import path from "node:path";
import fs from "fs";
import { fileURLToPath } from "node:url";

// Ricostruzione delle variabili globali per ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	data: new SlashCommandBuilder()
		.setName("lofi")
		.setDescription("Gestione della radio Lofi")
		// START subcommand
		.addSubcommand((subcommand) =>
			subcommand
				.setName("play")
				.setDescription("Avvia la radio lofi H24 nel canale audio"),
		)
		// STOP subcommand
		.addSubcommand((subcommand) =>
			subcommand
				.setName("stop")
				.setDescription("Ferma la radio e disconnette il bot"),
		),

	async execute(interaction) {
		// Retrieve the subcommand used
		const subcommand = interaction.options.getSubcommand();

		// --- PLAY LOGIC ---
		if (subcommand === "play") {
			const channel = interaction.member.voice.channel;

			if (!channel)
				return interaction.reply({
					content:
						"⛓️ **Detenuto!** Che insolenza... Cerchi di ascoltare la musica senza essere in cella? Entra subito in vocale!",
					ephemeral: true,
				});

			// Check if the bot is already connected in this guild
			const existingConnection = getVoiceConnection(interaction.guild.id);
			if (existingConnection) {
				return interaction.reply({
					content:
						"⚠️⛓️ Detenuto! Non vedi che la radio è già attiva? Usa `/lofi stop` se vuoi fermarla.",
					ephemeral: true,
				});
			}

			await interaction.reply(
				`🐱 **Ehi ${interaction.member}!** Basta combattere per oggi. Ascolta questa Lofi e rilassati!`,
			);

			const musicPath = path.join(__dirname, "../../assets/music/lofi.mp3");

			if (!fs.existsSync(musicPath)) {
				return interaction.followUp(`❌ File non trovato: ${musicPath}`);
			}

			// Channel connection
			const connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});

			// Player creation
			const player = createAudioPlayer({
				behaviors: {
					noSubscriber: NoSubscriberBehavior.Play,
				},
			});

			connection.subscribe(player);

			// Music playback function
			const playSong = () => {
				const resource = createAudioResource(musicPath, {
					inlineVolume: true,
				});
				player.play(resource);
			};

			// Start
			console.log("▶️ Riproduzione avviata...");
			playSong();

			// Infinite Loop Handling
			player.on(AudioPlayerStatus.Idle, () => {
				console.log("🔄 Loop: Riavvio la traccia...");
				playSong();
			});

			player.on("error", (error) => {
				console.error("❌ Error:", error.message);
			});
		}

		// --- STOP LOGIC ---
		else if (subcommand === "stop") {
			// Retrieve the current bot connection for this server
			const connection = getVoiceConnection(interaction.guild.id);

			if (!connection) {
				return interaction.reply({
					content:
						"❌⛓️ **Detenuto!** Che insolenza... Non vedi che il bot non è connesso a nessun canale vocale?",
					ephemeral: true,
				});
			}

			// Destroy the connection (disconnects the bot and stops the player)
			connection.destroy();

			return interaction.reply(
				"🛑 **Radio spenta.** Il bot è tornato al Leblanc.",
			);
		}
	},
};
