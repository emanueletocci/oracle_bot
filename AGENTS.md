# Oracle Discord Bot – Quick Agent Guide

## 1️⃣ Project layout
- **`bot/`** contains the full bot implementation (`dashboard/` and `landing/` are separate apps).
- Entry point: `bot/src/index.js`.
- Configuration lives in `bot/config.json` (not committed, copy `bot/config.example.json`).
- Commands are auto-loaded **recursively** from `bot/src/commands/` by `src/utils/commandLoader.js`.
  The first folder below `commands/` is the command's **module**:
  - `core/` → always available (sub-folders: `fun`, `moderation`, `music`, `utility`).
  - `persona/` → available only when the guild uses the Persona theme.
  - `dev/` → registered only in the development guild (`guildId` in config).
- Each command file must export a default object with **`data`** and **`execute(interaction, { theme })`**.
- User-facing texts come from the guild theme (`src/themes/`): use `theme.t("key", vars)`
  instead of hard-coded strings. `neutral.js` must contain every key; `persona.js` overrides only what it changes.
- Per-guild settings (currently only the theme) are read through `src/settings/guildSettings.js`.
- Events live under `bot/src/events/` and are registered in `index.js`.
- Scripts run directly with npm (e.g. command deploy) live in `bot/src/scripts/`.
- **Imports use subpath aliases** defined in `bot/package.json` → `imports`
  (`#config`, `#commands/*`, `#data/*`, `#settings/*`, `#themes/*`, `#utils/*`).
  Never use relative imports like `../../utils/logger.js`: write `#utils/logger.js`.
- **Filesystem paths** (assets, logs, …) come from `#utils/paths.js`; never build them from `__dirname`.

## 2️⃣ Development prerequisites
1. **Node 22+** (uses ES modules and JSON import attributes).
2. Install dependencies:
   ```bash
   cd bot
   npm ci   # or npm install
   ```
3. Create the config file:
   ```bash
   cp config.example.json config.json
   # edit config.json: token, clientId, guildId, welcomeChannelId, defaultTheme
   ```

## 3️⃣ Running the bot locally
```bash
cd bot
npm start
```

## 4️⃣ Deploying slash commands
```bash
cd bot
npm run deploy
```
The script is `bot/src/scripts/deploy-commands.js`. `core` and `persona` commands are deployed **globally**; `dev` commands only to `guildId`.

## 5️⃣ Development scripts
- **Start bot**: `npm start` (runs `node src/index.js`).
- **Watch for changes**: `npm run dev`.
- **Deploy slash commands**: `npm run deploy`.
- No lint or type‑check scripts are defined; use your editor tools if needed.

## 6️⃣ Common pitfalls
- The bot token must be in `bot/config.json`; the file is not committed.
- When adding a new command, export both `data` (SlashCommandBuilder) and `execute`. Missing either will log a warning.
- Slash command descriptions are global and cannot change per guild: keep `core` descriptions theme-neutral.
- A new text key must be added to `src/themes/neutral.js` first.
- If you change event handlers, ensure they export `{ name, execute }` or `{ name, once, distube, execute }` as expected by `index.js`.

## 7️⃣ Quick reference for agents
| Task | Typical command | Notes |
|------|-----------------|-------|
| Start bot | `node src/index.js` | Ensure config is present |
| Deploy commands | `npm run deploy` | Requires Discord API token in config |
| Reload a command (dev) | slash `/reload` (`commands/dev/reload.js`) | Dev guild only, admin permission |

---
Feel free to copy/paste these snippets into your session. Happy hacking!