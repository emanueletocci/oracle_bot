## 📡 Event List

Here is the complete list of **events** Oracle listens to.

Event handlers live in `bot/src/events/`: every `.js` file exports a default object, and `src/index.js` registers them automatically at startup.

| Export | Meaning |
| ------ | ------- |
| `name` | The event to listen to (required). |
| `execute` | The function that runs when the event fires (required). |
| `once: true` | Listen only the first time (e.g. `ClientReady`). |
| `distube: true` | Attach the event to `client.distube` instead of `client` (DisTube events). |

### Discord events (`client`)

| File | Event | Fires when | What Oracle does |
| ---- | ----- | ---------- | ---------------- |
| `clientReadyEvent.js` | `ClientReady` *(once)* | The bot has logged in. | Logs the account in use and sets the "Scanning for shadows" activity. |
| `errorEvent.js` | `Error` | An unhandled error on the client. | Logs it: this is the safety net that keeps the bot online. |
| `interactionCreateEvent.js` | `InteractionCreate` | A user interacts with the bot. | The heart of the bot: keeps slash commands only, resolves the guild theme from the settings database, blocks Persona commands outside the Persona theme, applies per-command cooldowns (default 3 s), runs the command, and answers errors with a short ID (the full stack trace goes to the log). |
| `guildCreate.js` | `GuildCreate` | The bot is added to a server. | Creates the guild's settings row in SQLite with the default theme, then logs. |
| `guildDelete.js` | `GuildDelete` | The bot is removed from a server. | Deletes the guild's settings row, then logs. |
| `welcomeEvent.js` | `GuildMemberAdd` | A member joins a server. | Generates a stylized welcome image with Canvas (random background, circular avatar, themed font), then posts it with a themed text to the guild's welcome channel (falls back to `welcomeChannelId` in `config.json`). |
| `voiceStateUpdateEvent.js` | `VoiceStateUpdate` | Someone joins, leaves or moves between voice channels. | Lofi radio: paused while nobody is listening, resumed on rejoin. Music: if the channel stays empty for 60 seconds, the queue is stopped and the bot leaves. |

### DisTube events (`client.distube`)

DisTube, the music engine, emits its own events. Handlers flagged with `distube: true` are attached to `client.distube`.

| File | Event | Fires when | What Oracle does |
| ---- | ----- | ---------- | ---------------- |
| `distubePlaySongEvent.js` | `playSong` | A song starts playing. | Posts a themed "now playing" message in the queue's text channel. |
| `distubeErrorEvent.js` | `error` | A song fails or the stream breaks. | Finds the error and the text channel among the emitted arguments, posts a themed warning (never longer than Discord's 2000-character limit) and logs the technical details. |

### Required intents

`src/index.js` requests these [gateway intents](https://discord.com/developers/docs/topics/gateway#gateway-intents):

| Intent | Used for |
| ------ | -------- |
| `Guilds` | Servers, channels, roles, interactions. |
| `GuildMembers` ⚠️ *privileged* | `welcomeEvent.js` (member joins). Self-hosters must enable it in the Developer Portal under *Bot → Privileged Gateway Intents*, or the bot refuses to log in. |
| `GuildVoiceStates` | Voice channel tracking for lofi and music. |
| `GuildMessages` | Message features. |

> **Note:** the Lofi radio does not use DisTube: it plays through `@discordjs/voice` directly, so its player events are handled inside `commands/core/music/lofi.js`. The two audio systems are kept apart by `src/utils/audioState.js` and `voiceStateUpdateEvent.js`, so they never fight over the voice connection.
