import {
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
} from "discord.js";
import path from "node:path";
import fs from "fs";
import colors from "../../utils/colors.js";
import { fileURLToPath } from "node:url";

// Variable Reconstruction
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generatePhantomText(target, sinInput) {
    const sin = sinInput.toLowerCase();

    // ARRAY OF OBJECTS: Database of sins
    const sinDefinitions = [
        {
            id: "lussuria",
            keywords: ["lussuria", "piacere", "sesso", "perversione", "osceno", "voglia", "carnale"],
            text: `**Sir ${target}, schiavo del piacere.**\nHai trattato le persone come oggetti per il tuo mero divertimento. La tua visione distorta dell'amore ha ferito troppi cuori innocenti.\n\nNon resteremo a guardare.`,
        },
        {
            id: "gola",
            keywords: ["gola", "fame", "cibo", "mangiare", "ingordigia", "sazio", "divorare"],
            text: `**Sir ${target}, divoratore insaziabile.**\nLa tua fame non conosce fine. Consumi tutto ciò che ti circonda senza lasciare nulla agli altri, riempiendo il vuoto della tua anima con eccessi materiali.\n\nÈ ora di metterti a dieta forzata.`,
        },
        {
            id: "avarizia",
            keywords: ["avarizia", "soldi", "denaro", "ricchezza", "taccagno", "tirchio", "avidità", "avido", "tesoro"],
            text: `**Sir ${target}, avido mercante d'anime.**\nValuti il denaro e il possesso più della vita umana. Hai calpestato chiunque pur di accrescere il tuo tesoro personale.\n\nTi porteremo via ciò che ritieni più prezioso.`,
        },
        {
            id: "accidia",
            keywords: ["accidia", "pigrizia", "noia", "sonno", "indifferenza", "ignavia", "dormire", "apatico"],
            text: `**Sir ${target}, prigioniero dell'indifferenza.**\nHai chiuso gli occhi davanti alle ingiustizie, scegliendo la via più facile del non fare nulla. Il tuo disinteresse è un veleno che sta uccidendo chi ti sta intorno.\n\nTi costringeremo ad aprire gli occhi.`,
        },
        {
            id: "ira",
            keywords: ["ira", "rabbia", "furia", "odio", "violenza", "collera", "nervoso", "incazzato", "esplosivo"],
            text: `**Sir ${target}, vulcano di rabbia.**\nLa tua collera esplosiva è solo un capriccio infantile. Hai usato la violenza verbale e l'intimidazione per piegare gli altri al tuo volere.\n\nSpegneremo le fiamme della tua follia.`,
        },
        {
            id: "invidia",
            keywords: ["invidia", "gelosia", "geloso", "successo", "copiare", "rosicare", "invidioso"],
            text: `**Sir ${target}, dagli occhi verdi di gelosia.**\nNon sopporti la luce altrui perché evidenzia le tue ombre. Hai tramato nell'ombra per affossare chi ha successo solo per sentirti migliore.\n\nTi mostreremo quanto sei piccolo.`,
        },
        {
            id: "superbia",
            keywords: ["superbia", "ego", "orgoglio", "vanità", "arroganza", "arrogante", "superiore", "dio", "migliore"],
            text: `**Sir ${target}, re del nulla.**\nGuardi tutti dall'alto in basso dal tuo piedistallo di arroganza. Credi di essere intoccabile e superiore alle regole comuni.\n\nTi faremo scendere dal trono.`,
        },
    ];

    // --- SEARCHING LOGIC ---
    const foundDefinition = sinDefinitions.find((def) =>
        def.keywords.some((keyword) => sin.includes(keyword))
    );

    if (foundDefinition) {
        return `${foundDefinition.text}\n\n**Stanotte, ruberemo il tuo cuore distorto e ti faremo confessare i tuoi crimini con la tua stessa bocca.**`;
    }

    // --- FALLBACK: Random Generator ---
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
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("peccato") 
                .setDescription("Il desiderio distorto o il peccato")
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("target");
        const sin = interaction.options.getString("peccato");

        // --- SETUP PATHS ---
        const p5LogoPath = path.join(__dirname, "../../assets/images/hat.png");
        const p5LogoName = "hat.png";

        const ccPath = path.join(__dirname, "../../assets/images/callingCard.png");
        const ccName = "callingCard.png";

        // --- CHECK FILE EXISTENCE ---
        if (!fs.existsSync(ccPath) || !fs.existsSync(p5LogoPath)) {
            console.error(`❌ Errore file mancanti:\nCard: ${ccPath}\nLogo: ${p5LogoPath}`);
            return interaction.reply({
                content: "❌ **Errore di sistema:** Impossibile trovare le risorse grafiche (Card o Logo).",
                ephemeral: true,
            });
        }

        const ccAttachment = new AttachmentBuilder(ccPath, { name: ccName });
        const p5LogoAttachment = new AttachmentBuilder(p5LogoPath, { name: p5LogoName });

        const finalDescription = generatePhantomText(target, sin);

        // --- EMBED CREATION ---
        const cardEmbed = new EmbedBuilder()
            .setColor(colors.p5_red)
            .setTitle("TAKE YOUR HEART 🔥")
            .setAuthor({
                name: "I Ladri Fantasma di Cuori",
                iconURL: `attachment://${p5LogoName}`, 
            })
            .setDescription(finalDescription)
            .setImage(`attachment://${ccName}`) 
            .setFooter({ text: "Dacci il tuo cuore." })
            .setTimestamp();

        await interaction.reply({
            content: `📩 **Lettera di Sfida inviata a ${target}!**`,
            embeds: [cardEmbed],
            files: [ccAttachment, p5LogoAttachment],
        });
    },
};