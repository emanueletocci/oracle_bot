## 🃏 Command List

Here is the complete list of commands available in the **Oracle** bot (29 total).

Commands are grouped in **modules**:

- **Core**: always available. Their replies follow the server theme (Persona or neutral).
- **Persona**: available only when the server uses the Persona 5 Royal theme.
- **Dev**: registered only in the development guild (`guildId` in `config.json`).

> Slash command names and descriptions are **global** (a Discord limitation): they are the same in every server. Only the *replies* follow the server theme.

### 🎭 Core · Fun

| Command | Options | Description |
| ------- | ------- | ----------- |
| `/coinflip` | — | Flip a coin. With the Persona theme: Phantom Thieves or Shadows? |
| `/roll` | `facce` (default 6), `quantita` (default 1) | Roll one or more dice. |
| `/ship` | `utente1` (required), `utente2` (optional, defaults to you) | Evaluate the affinity between two people (Social Link in the Persona theme). |
| `/slap` | `target` | Slap someone (an All-Out Attack in the Persona theme). |

### 🛡️ Core · Moderation

| Command | Options | Default permission | Description |
| ------- | ------- | ------------------ | ----------- |
| `/ban` | `target`, `reason` | Ban members | Ban a user from the server. |
| `/banlist` | — | Ban members | Show the list of banned users. |
| `/kick` | `target`, `reason` | Kick members | Kick a user from the server. |
| `/unban` | `userid`, `reason` | Ban members | Remove a ban by user ID. |
| `/role` | `add <target> <role>`, `remove <target> <role>` | Manage roles | Add or remove a role from a user. |

### 🎵 Core · Music

| Command | Subcommands | Description |
| ------- | ----------- | ----------- |
| `/lofi` | `play`, `stop` | Manage the 24/7 Lofi radio. Pauses automatically when nobody is listening. |
| `/music` | `play <query>`, `stop`, `join`, `queue`, `nowplaying`, `skip`, `pause`, `resume`, `volume <level>`, `loop`, `shuffle`, `seek <seconds>`, `remove <position>` | Play and control songs from external sources (YouTube, direct links). |
| `/radio` | `play <station>`, `stop`, `list`, `save <name> <url>`, `remove <name>` | Play 24/7 radio stations. `play` resolves the name in one step: built-in/saved exact match, otherwise a worldwide search on radio-browser.info (e.g. "kiss kiss"). A clear match plays immediately, several candidates show a numbered button picker. `save`/`remove` need admin. |

The two systems share the bot's voice connection and never run together: starting one blocks the other.

### 🔧 Core · Utility

| Command | Options / Subcommands | Default permission | Description |
| ------- | --------------------- | ------------------ | ----------- |
| `/clean` | `amount` (max 100) | Administrator | Delete a specific amount of messages (bulk delete). |
| `/help` | — | — | Display the commands available in this server. |
| `/info` | `user <target>`, `server` | — | Get information about a user or the server. |
| `/avatar` | `target` (optional) | — | Show a user's avatar. |
| `/banner` | `target` (optional) | — | Show a user's banner. |
| `/emoji` | `emoji` | — | Enlarge a custom emoji. |
| `/ping` | — | — | Show the bot's latency. |
| `/uptime` | — | — | Show how long the bot has been online. |
| `/stats` | — | — | Show bot statistics. |
| `/serverinfo` | — | — | Show information about the server. |
| `/roleinfo` | `role` | — | Show information about a role. |
| `/theme` | `list`, `set <name>`, `reset` | Manage server | View or change the bot theme of this server. Changes are persisted in the SQLite database and survive restarts. |

### 🃏 Persona module

| Command | Options | Description |
| ------- | ------- | ----------- |
| `/callingcard` | `target`, `peccato` | Send a **Calling Card** to a specific user. |
| `/fusion` | `material1`, `material2` | Perform a fusion in the **Velvet Room** using two users as materials. |
| `/tarot` | — | Chihaya draws an Arcana and reveals your **Confidant**. |

### 🛠️ Dev (development server only)

| Command | Options | Description |
| ------- | ------- | ----------- |
| `/reload` | `command` | Reload a command without restarting the bot. |
| `/testwelcome` | — | Simulate the welcome message. |
