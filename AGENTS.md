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

## 5️⃣ Testing & linting (optional)
- **Lint**: `npm run lint` (uses ESLint config in repo root).
- **Type‑check**: Not set up; rely on VSCode or TS compiler if added.
- **Unit tests**: None currently. If you add tests, place them under `src/test/` and run with `npm test`.

## 6️⃣ Common pitfalls
- The bot token must be in `config.json`; the file is not committed.
- When adding a new command, export both `data` (SlashCommandBuilder) and `execute`. Missing either will log a warning.
- If you change event handlers, ensure they export `{ name, execute }` or `{ name, once, distube, execute }` as expected by `index.js`.

## 7️⃣ Quick reference for agents
| Task | Typical command | Notes |
|------|-----------------|-------|
| Start bot | `node src/index.js` | Ensure config is present |
| Deploy commands | `node deploy_commands.js` | Requires Discord API token in config |
| Reload a command (dev) | `./commands/utils/reload.js` via slash `/reload` | Only works if the bot has admin rights |

---
Feel free to copy/paste these snippets into your session. Happy hacking!