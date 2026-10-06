# 📡 Events

This folder contains Oracle's **event handlers**: files that tell the bot *what to do when something happens*. This guide explains what events are, how they are loaded, and which ones the bot uses today.

---

## What is an event?

A Discord bot does not keep asking Discord "did something happen?". Instead, Discord **tells the bot** every time something important happens: a user joins a server, someone uses a slash command, a message is deleted, and so on. It does this through a connection that is always open, called the **gateway** (a WebSocket).

discord.js receives these messages and turns them into **events** sent by the `client` object. Our job is simply to say: *"when event X happens, run this function"*.

```js
client.on("guildMemberAdd", (member) => {
    console.log(`${member.user.tag} joined the server`);
});
```

Think of it like a doorbell: `client.on(...)` installs the doorbell, Discord rings it, and your function answers.

### `on` and `once`

- `client.on(event, fn)` runs `fn` **every time** the event happens.
- `client.once(event, fn)` runs `fn` **only the first time**, then removes itself. Use it for events like `ready`, which only need to be handled once at startup.

---

## How Oracle loads events

Instead of writing every `client.on(...)` inside `index.js`, each event lives in its **own file** in this folder. At startup, `src/index.js` reads every `.js` file in here and registers it automatically:

```js
for (const file of eventFiles) {
    const event = (await import(filePath)).default;

    if (event.distube) {
        client.distube.on(event.name, (...args) => event.execute(...args));
    } else if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
```

So to add a new event, you just create a new file in this folder. You don't need to touch `index.js`.

### Structure of an event file

Each file exports an object with these fields:

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | The name of the event to listen to. For Discord events, use the `Events` constants (for example `Events.InteractionCreate`) instead of plain strings, so typos are caught early. |
| `execute` | yes | The function that runs when the event happens. It receives the event's arguments (for example `interaction`, `member`...). |
| `once` | no | If `true`, the event is handled only once. Default: `false`. |
| `distube` | no | If `true`, the event is attached to `client.distube` instead of `client` (see below). |

A minimal example:

```js
import { Events } from "discord.js";
import logger from "#utils/logger.js";

export default {
    name: Events.GuildCreate,
    execute(guild) {
        logger.info(`Oracle was added to the server ${guild.name} (${guild.id})`);
    },
};
```

---

## Events Oracle uses today

### Discord events (`client`)

| File | Event | When it fires | What Oracle does |
|---|---|---|---|
| `ready.js` | `ClientReady` *(once)* | Once, when the bot has logged in and is ready to work. | Writes `Client ready: logged in as ...` to the log. |
| `interactionCreate.js` | `InteractionCreate` | Every time a user interacts with the bot: slash commands, buttons, menus, modals... | The heart of the bot. It keeps only slash commands, finds the right command, checks theme and cooldown, runs it, and handles errors. |
| `welcome.js` | `GuildMemberAdd` | Every time a user joins a server where Oracle is. | Creates a welcome image with Canvas and sends it to the configured channel (`welcomeChannelId`). |

### DisTube events (`client.distube`)

DisTube, the library that plays music, is **not part of Discord**. It is a separate object that sends its own events (song started, queue finished, error...). This is why files with `distube: true` are attached to `client.distube` and not to `client`.

| File | Event | When it fires | What Oracle does |
|---|---|---|---|
| `distubePlaySong.js` | `playSong` | When a song starts playing. | Posts a "now playing" message in the queue's text channel. |
| `distubeError.js` | `error` | When DisTube hits an error (song not found, stream stopped...). | Logs the error and warns users in the channel, never going over Discord's 2000-character limit. |

> **Note:** the `/lofi` command does not use DisTube. It uses `@discordjs/voice` directly, so its events (the player's `Idle` and `error`) are handled inside `commands/core/music/lofi.js`, not here.

---

## Events and intents

Discord does not send the bot *every* event. It only sends events from the categories the bot asked for at startup. These categories are called **intents**. In `src/index.js`:

```js
intents: [
    GatewayIntentBits.Guilds,           // servers, channels, roles, interactions
    GatewayIntentBits.GuildMembers,     // members joining/leaving → welcome.js
    GatewayIntentBits.GuildVoiceStates, // who is in which voice channel → music
    GatewayIntentBits.GuildMessages,    // messages in servers
],
```

If an event never arrives, the first thing to check is the intent. For example, without `GuildMembers` the `GuildMemberAdd` event would never fire and `welcome.js` would stay silent.

Some intents are **privileged** and must also be turned on in the [Developer Portal](https://discord.com/developers/applications), under *Bot → Privileged Gateway Intents*. `GuildMembers` is one of them: anyone who self-hosts Oracle must remember to enable it, or the bot will not even start.

---

## Errors in events: be careful

Almost all handlers are `async` functions. If an error inside a `client` event is not caught, discord.js turns it into an `error` event on the client. **If nothing is listening to the `error` event, Node stops the process and the bot goes offline.**

This is exactly what caused the `Unknown interaction (10062)` crash: an error thrown inside the `catch` block of `interactionCreate.js` was not handled by anything.

Two simple rules:

1. Inside every `execute` that does something that can fail (Discord calls, files, network), use `try/catch`. Also be careful with what you do *inside* the `catch`: if that can fail too, it needs its own `try/catch`.
2. Always keep a global listener as a safety net, so an escaped error gets logged instead of crashing the bot:

```js
// errorHandler.js
import { Events } from "discord.js";
import logger from "#utils/logger.js";

export default {
    name: Events.Error,
    execute(error) {
        logger.error("Client error", error);
    },
};
```

---

## The 3-second limit

`InteractionCreate` has a special rule: Discord gives you **3 seconds** to answer an interaction. If a command can take longer (loading images, network calls, moderation actions), it must call `interaction.deferReply()` right away and answer later with `interaction.editReply()`. This raises the time limit to 15 minutes.

---

## Useful events Oracle does not use (yet)

Some events that could be useful later, especially for the *Security Suite* in the roadmap:

| Event | When it fires | Possible use |
|---|---|---|
| `GuildCreate` / `GuildDelete` | The bot is added to or removed from a server. | Logging, setting up the server's settings. |
| `GuildMemberRemove` | A user leaves the server. | Goodbye messages. |
| `GuildBanAdd` / `GuildBanRemove` | A user is banned or unbanned (also by hand, not only through Oracle). | Moderation logs. Needs the `GuildModeration` intent. |
| `MessageDelete` / `MessageUpdate` | A message is deleted or edited. | Moderation logs. Reading the message text needs the privileged `MessageContent` intent. |
| `VoiceStateUpdate` | Someone joins, leaves or switches a voice channel. | Stopping the lofi radio when the channel is empty. |
| `ShardDisconnect` / `ShardReconnecting` | The gateway connection drops or is reconnecting. | Finding network problems. |
| `Error` | An unhandled error on the client. | Safety net against crashes (see above). |

The full list is in the [discord.js documentation](https://discord.js.org/docs/packages/discord.js/main/Events:Enum).