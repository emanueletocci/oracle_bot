// src/utils/paths.js
//
// Absolute paths to the main folders of the project.
// They are built from this file's location, so they work
// no matter which folder the bot is started from.
//
// Only the stable structure lives here. Folders used by a single
// feature (e.g. images/coins) are built in the file that uses them:
//   const COINS_DIR = path.join(IMAGES_DIR, "coins");

import path from "node:path";
import { fileURLToPath } from "node:url";

// This file lives in bot/src/utils, so the project root is two levels up
const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(here, "../..");

// -----------------------------------------------------------------------------
// SOURCE
// -----------------------------------------------------------------------------
export const SRC_DIR = path.join(ROOT_DIR, "src");
export const COMMANDS_DIR = path.join(SRC_DIR, "commands");
export const EVENTS_DIR = path.join(SRC_DIR, "events");

// -----------------------------------------------------------------------------
// ASSETS
// -----------------------------------------------------------------------------
export const ASSETS_DIR = path.join(ROOT_DIR, "assets");
export const IMAGES_DIR = path.join(ASSETS_DIR, "images");
export const GIFS_DIR = path.join(ASSETS_DIR, "gif");
export const FONTS_DIR = path.join(ASSETS_DIR, "fonts");
export const MUSIC_DIR = path.join(ASSETS_DIR, "music");

// -----------------------------------------------------------------------------
// LOGS
// -----------------------------------------------------------------------------
export const LOGS_DIR = path.join(ROOT_DIR, "logs");
