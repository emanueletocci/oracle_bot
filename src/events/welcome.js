// Welcome event handler: generates a stylized welcome image for new guild members
// and sends it to the configured welcome channel. Uses Canvas to draw the image,
// selects a random background (if available), draws the username and avatar,
// and composes the final message with an attachment.
import { Events, AttachmentBuilder } from "discord.js";
import { request } from "undici";
import colors from "../utils/colors.js";
import config from "../config.json" with { type: "json" };
import Canvas from "@napi-rs/canvas";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Ricostruzione delle variabili globali per ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// Font registration
// =============================================================================
const fontPath = path.join(__dirname, "../assets/fonts/earwig.otf");
const fontFamily = fs.existsSync(fontPath) ? "PersonaFont" : "Arial";

if (fontFamily === "PersonaFont") {
    Canvas.GlobalFonts.registerFromPath(fontPath, "PersonaFont");
    console.debug("[DEBUG] Font Persona 5 registered successfully.");
} else {
    console.warn("[WARN] Font not found. Using Arial fallback.");
}

export default {
    enabled: true,
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        // Entry point for the GuildMemberAdd event. `member` is the newly
        // joined guild member. We build an image and post it to the
        // configured channel.
        console.debug(
            `[DEBUG] GuildMemberAdd event triggered for: ${member.user.tag}`,
        );

        const channelId = config.welcomeChannelId;
        const channel = member.guild.channels.cache.get(channelId);

        if (!channel) {
            console.error(`[ERROR] Canale con ID ${channelId} non trovato!`);
            return;
        }

        try {
            // =================================================================
            // CANVAS SETUP
            // =================================================================
            const canvas = Canvas.createCanvas(1200, 675);
            const context = canvas.getContext("2d");

            // anchorX is used as the approximate horizontal center for the
            // right-side layout (text and avatar). Transformations are
            // applied relative to this point for rotated text/shapes.
            const anchorX = 900;

            // Path to optional background images. If the directory exists and
            // contains png/jpg images, one will be chosen at random. Otherwise
            // a solid fallback color is used.
            const backgroundsFolder = path.join(
                __dirname,
                "..",
                "assets",
                "images",
                "backgrounds",
                "welcome",
            );

            let backgroundLoaded = false;

            try {
                if (fs.existsSync(backgroundsFolder)) {
                    const files = fs.readdirSync(backgroundsFolder);
                    const validImages = files.filter(
                        (file) => file.endsWith(".png") || file.endsWith(".jpg"),
                    );

                    if (validImages.length > 0) {
                        const randomImage =
                            validImages[Math.floor(Math.random() * validImages.length)];
                        const bgPath = path.join(backgroundsFolder, randomImage);

                        console.debug(`[DEBUG] Selected random background: ${randomImage}`);

                        // Draw the chosen background stretched to the canvas.
                        const background = await Canvas.loadImage(bgPath);
                        context.drawImage(background, 0, 0, canvas.width, canvas.height);
                        backgroundLoaded = true;
                    } else {
                        console.warn("[WARN] No png/jpg images found in folder.");
                    }
                } else {
                    console.warn(`[WARN] Cartella non trovata: ${backgroundsFolder}`);
                }
            } catch (err) {
                console.warn("[WARN] Errore caricamento sfondo:", err.message);
            }

            // If no background image was loaded, fill with a branded color
            // so the image is still visually consistent.
            if (!backgroundLoaded) {
                context.fillStyle = colors.p5_red;
                context.fillRect(0, 0, canvas.width, canvas.height);
            }

            context.save();

            // =================================================================
            // WELCOME TEXT
            // =================================================================

            // Draw a rotated 'WELCOME' title near the top-right area. We
            // apply translate+rotate so the text appears angled for style.
            context.translate(anchorX, 400);
            context.rotate((-5 * Math.PI) / 180);

            context.font = "75px PersonaFont";
            context.textAlign = "center";
            context.fillStyle = "white";

            context.fillText("WELCOME", 0, 0);

            context.lineWidth = 2;
            context.strokeStyle = "black";
            context.strokeText("WELCOME", 0, 0);

            context.restore();

            context.save();

            // =================================================================
            // USERNAME PANEL
            // =================================================================

            // Draw a tilted white panel and render the username on top of
            // it. The panel is a rotated polygon for stylistic framing.
            context.translate(anchorX, 500);
            context.rotate((-3 * Math.PI) / 180);

            context.fillStyle = "white";
            context.beginPath();

            context.moveTo(-220, -40);
            context.lineTo(230, -50);
            context.lineTo(210, 40);
            context.lineTo(-230, 30);
            context.closePath();
            context.fill();

            // Username text: measure and scale the font so it fits within
            // the available width. `applyText` adjusts font size accordingly.
            context.fillStyle = "black";
            context.textAlign = "center";

            const username = member.user.username.toUpperCase();

            context.font = applyText(canvas, username, 400);

            context.fillText(username, 0, 18);
            context.restore();

            try {
                // =============================================================
                // USER AVATAR
                // =============================================================
                const { body } = await request(
                    member.user.displayAvatarURL({ extension: "png", size: 256 }),
                );
                const avatar = await Canvas.loadImage(await body.arrayBuffer());

                const avatarX = anchorX;
                const avatarY = 230;
                const avatarRadius = 85;

                // Clip to a circular path so the avatar draws as a circle.
                context.save();
                context.beginPath();
                context.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
                context.closePath();
                context.clip();

                context.drawImage(
                    avatar,
                    avatarX - avatarRadius,
                    avatarY - avatarRadius,
                    avatarRadius * 2,
                    avatarRadius * 2,
                );
                context.restore();

                // White stroke around avatar
                context.beginPath();
                context.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
                context.lineWidth = 7;
                context.strokeStyle = "white";
                context.stroke();

                // Outer colored stroke (brand color)
                context.beginPath();
                context.arc(avatarX, avatarY, avatarRadius + 6, 0, Math.PI * 2, true);
                context.lineWidth = 4;
                context.strokeStyle = colors.p5_red;
                context.stroke();
            } catch (err) {
                console.error("[ERROR] Impossibile caricare avatar utente:", err);
            }

            // Create an attachment from the canvas PNG buffer and send the
            // welcome message. Keep the content localized (Italian in this
            // project) but the image annotations and code comments remain in
            // English for developer clarity.
            const attachment = new AttachmentBuilder(await canvas.encode("png"), {
                name: "welcome.png",
            });

            await channel.send({
                content: `Benvenuto nei Phantom Thieves, ${member}!`,
                files: [attachment],
            });

            console.log(`[SUCCESS] Sent welcome for ${member.user.tag}`);
        } catch (error) {
            console.error(`[CRITICAL ERROR]`, error);
        }
    },
};

function applyText(canvas, text, maxWidth) {
    const context = canvas.getContext("2d");
    let fontSize = 65;

    do {
        context.font = `${(fontSize -= 5)}px PersonaFont`;
    } while (context.measureText(text).width > maxWidth - 20 && fontSize > 10);

    return context.font;
}