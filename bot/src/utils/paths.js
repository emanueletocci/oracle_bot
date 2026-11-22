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

// -----------------------------------------------------------------------------
// DATA (written at runtime)
// -----------------------------------------------------------------------------
// Everything the bot writes while running (SQLite database, and later the
// theme packs) lives under one directory, so a Docker deployment only needs
// to mount a single volume. Override it with the ORACLE_DATA_DIR environment
// variable; the default keeps local development identical to today (files
// inside the repository folder).
export const DATA_DIR = process.env.ORACLE_DATA_DIR
	? path.resolve(process.env.ORACLE_DATA_DIR)
	: ROOT_DIR;

export const DATABASE_PATH = path.join(DATA_DIR, "data", "oracle.db");

// -----------------------------------------------------------------------------
// REMOTE ASSETS (CDN)
// -----------------------------------------------------------------------------
// Base URL for the static images referenced by themes. When set, commands
// embed images by URL and Discord fetches them server-side (the bot never
// uploads them — useful on slow or unreliable uplinks). Defaults to jsDelivr
// serving this repository's assets. Set ORACLE_ASSET_BASE_URL to an empty
// string to fall back to local file attachments.
export const ASSET_BASE_URL = process.env.ORACLE_ASSET_BASE_URL ??
	"https://cdn.jsdelivr.net/gh/emanueletocci/oracle_bot@main/bot/assets/images";
