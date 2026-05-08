import {
	SlashCommandBuilder,
	EmbedBuilder,
	AttachmentBuilder,
	MessageFlags,
} from "discord.js";
import fs from "fs";
import path from "node:path";
import colors from "../../data/colors.js";
import { sinDefinitions } from "../../data/sins.js";
import logger from "../../utils/logger.js";
import { IMAGES_DIR } from "../../utils/paths.js";

function generatePhantomText(target, sinInput) {
	const sin = sinInput.toLowerCase();

	const foundDefinition = sinDefinitions.find((def) =>
		def.keywords.some((keyword) => sin.includes(keyword)),
	);

	if (foundDefinition) {
		const formattedText = foundDefinition.text.replaceAll("{target}", target);
		return `${formattedText}\n\n**Stanotte, ruberemo il tuo cuore distorto e ti faremo confessare i tuoi crimini con la tua stessa bocca.**`;
	}

	const intros = [
		`**Sir ${target}, efferato peccatore di ${sinInput}.**`,
		`**A te, ${target}, che ti crogioli nel vizio: "${sinInput}".**`,
		`**Ascolta bene, ${target}.** Il tuo crimine è l'ossessione per **${sinInput}**.`,
	];

	const accusations = [
		`Sei schiavo dei tuoi desideri distorti. Hai permesso a questa ossessione di deformare la realtà.`,
		`Tratti chi ti circonda come pedine nel tuo gioco malato. Il tuo ego ha superato ogni limite.`,
		`Il tuo palazzo di menzogne è diventato troppo grande per essere ignorato.`,
		`Credi che nessuno veda la tua vera natura? Noi vediamo tutto.`,
		`Hai sacrificato la tua umanità per questo desiderio distorto.`,
	];

	const threats = [
		`Non possiamo restare a guardare mentre appassisci nella tua corruzione.`,
		`Il tuo regno di terrore finisce oggi.`,
		`I Ladri Fantasma sono qui per correggere la società, iniziando da te.`,
		`Non avremo alcuna pietà per chi calpesta i deboli.`,
	];

	const r = (arr) => arr[Math.floor(Math.random() * arr.length)];

	return `${r(intros)}\n${r(accusations)}\n${r(threats)}\n\n**Stanotte, ruberemo il tuo cuore distorto e ti faremo confessare i tuoi crimini con la tua stessa bocca.**`;
}

export default {
	data: new SlashCommandBuilder()
		.setName("callingcard")
		.setDescription("Invia una Lettera di Sfida (Calling Card)")
		.addUserOption((option) =>
			option
				.setName("target")
				.setDescription("L'utente da avvisare")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("peccato")
				.setDescription("Il desiderio distorto o il peccato")
				.setRequired(true),
		),

	async execute(interaction) {
		const target = interaction.options.getUser("target");
		const sin = interaction.options.getString("peccato");

		const hatImagePath = path.join(IMAGES_DIR, "hat.png");
		const callingCardImagePath = path.join(IMAGES_DIR, "callingCard.png");

		if (!fs.existsSync(callingCardImagePath) || !fs.existsSync(hatImagePath)) {
			logger.error(`Missing required calling card assets. Card path: ${callingCardImagePath}. Logo path: ${hatImagePath}.`);
			return interaction.reply({
				content:
					"❌ **Errore di sistema:** Impossibile trovare le risorse grafiche (Card o Logo).",
				flags: MessageFlags.Ephemeral,
			});
		}

		const ccAttachment = new AttachmentBuilder(callingCardImagePath, {
			name: "callingCard.png",
		});
		const p5LogoAttachment = new AttachmentBuilder(hatImagePath, {
			name: "hat.png",
		});

		const finalDescription = generatePhantomText(target, sin);

		const cardEmbed = new EmbedBuilder()
			.setColor(colors.p5_red)
			.setTitle("TAKE YOUR HEART 🔥")
			.setAuthor({
				name: "I Ladri Fantasma di Cuori",
				iconURL: "attachment://hat.png",
			})
			.setDescription(finalDescription)
			.setImage("attachment://callingCard.png")
			.setFooter({ text: "Dacci il tuo cuore." })
			.setTimestamp();

		await interaction.reply({
			content: `📩 **Lettera di Sfida inviata a ${target}!**`,
			embeds: [cardEmbed],
			files: [ccAttachment, p5LogoAttachment],
		});

		logger.info(
			`Calling card command executed successfully for target ${target.id} in guild ${interaction.guildId}.`
		);
	},
};