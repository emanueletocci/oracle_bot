// src/utils/paths.js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname = .../src/utils
export const ROOT_DIR = path.resolve(__dirname, "../..");
export const SRC_DIR = path.join(ROOT_DIR, "src");
export const ASSETS_DIR = path.join(ROOT_DIR, "assets");
export const LOGS_DIR = path.join(ROOT_DIR, "logs");

export const IMAGES_DIR = path.join(ASSETS_DIR, "images");
export const GIFS_DIR = path.join(ASSETS_DIR, "gif");
export const FONTS_DIR = path.join(ASSETS_DIR, "fonts");

export const CHARACTERS_DIR = path.join(IMAGES_DIR, "characters");
export const COINS_DIR = path.join(IMAGES_DIR, "coins");
export const BACKGROUNDS_DIR = path.join(IMAGES_DIR, "backgrounds");
export const SLAPS_DIR = path.join(GIFS_DIR, "slaps");