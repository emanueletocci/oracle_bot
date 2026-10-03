<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Oracle Discord Bot – Quick Agent Guide

## 1️⃣ Project layout
- **`apps/bot/`** contains the full bot implementation.
- Entry point: `apps/bot/src/index.js`.
- Configuration lives in `apps/bot/src/config.json` (contains the bot token).
- Commands are auto‑loaded from `apps/bot/src/commands/*/`.  Each command file must export a default object with **`data`** and **`execute`**.
- Events live under `apps/bot/src/events/` and are registered in `index.js`.

## 2️⃣ Development prerequisites
1. **Node 20+** (uses ES modules).
2. Install dependencies:
   ```bash
   cd apps/bot
   npm ci   # or npm install
   ```
3. Create a copy of the config file with your bot token:
   ```bash
   cp src/config.json.example src/config.json
   # edit src/config.json and set "token": "<YOUR_BOT_TOKEN>"
   ```

## 3️⃣ Running the bot locally
```bash
cd apps/bot
node src/index.js
```
The bot will connect to Discord with the token in `config.json`.

## 4️⃣ Deploying slash commands
Use the bundled script:
```bash
cd apps/bot
node deploy_commands.js
```
It reads the command definitions and registers them via the Discord API.

## 5️⃣ Development scripts
- **Start bot**: `npm start` (runs `node src/index.js`).
- **Watch for changes**: `npm dev`.
- **Deploy slash commands**: `npm deploy`.

## 6️⃣ Common pitfalls
- The bot token must be in `config.json`; the file is not committed.
- When adding a new command, export both `data` (SlashCommandBuilder) and `execute`. Missing either will log a warning.
- If you change event handlers, ensure they export `{ name, execute }` or `{ name, once, distube, execute }` as expected by `index.js`.

