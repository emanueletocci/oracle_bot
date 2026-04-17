# 🗺️ Project Roadmap

## ⚙️ The Phantom Thieves (System & Audio/Visual)

Features related to the bot's engine, music playback, and visual generation.

* [x] **Core Bot Structure:** Command Handler, Event Handler, and Discord.js setup.
* [x] **Lofi Radio:** Implementation of the Lo-Fi radio system (`/lofi`).
* [ ] **Music Streaming:** Enable music streaming from external platforms (e.g., YouTube/Spotify).
* [x] **Visual Upgrade (Canvas):** Implement `canvas` or `sharp` to generate dynamic images for `/welcome`.

## 🎭 Metaverse Activities (Social & Fun)

Commands for user interaction and entertainment.

* [x] **Basic Fun Commands:** Implementation of RNG and interaction commands (`/tarot`, `/ship`, `/fusion`, `/roll`, `/coinflip`).
* [x] **All-Out Attack:** dynamic animation command targeting a user.

## 🎰 The Casino (Economy & RPG Expansion)

The core gamification system based on Persona 5 mechanics.

* [ ] **Economy System (Yen):** Virtual currency system where users earn money by being active.
* [ ] **Phantom Thief Rank (Leveling):** XP system where users start as "Inmates" and rise to "Phantom Thieves".
* [ ] **Social Stats:** Character statistics (Knowledge, Guts, Proficiency, Kindness, Charm) unlocking specific commands.
* [ ] **Tanaka's Amazing Commodities (Shop):** A store system to spend Yen on server roles, items, or badges.
* [ ] **Turn-Based Minigames:** RPG-style battles against Shadows to earn Yen and XP.
* [ ] **Mementos Requests:** Random mission generator for extra rewards.
* [ ] **Leaderboards:** Global ranking for Wealth and XP.

## 🛡️ Palace Security (Moderation & Utility)

Advanced tools to maintain order and manage the server.

* [ ] **Basic Moderation Suite:** Comprehensive tools to ensure integrity (`/kick`, `/ban`, `/mute`, `/purge`).
* [ ] **Safe Rooms (Dynamic Voice Channels):** A "Join-to-Create" system for temporary private voice channels.
* [ ] **Cognitive Backup:** System to save server roles/channels into a JSON/DB file for emergency restoration.

## 🌐 The Phan-Site (Web Integration)

External access and management via browser.

* [ ] **Web Dashboard Integration:** Admin interface to configure modules and view analytics.
* [ ] **User Profile Portal:** Web page where users can view their Stats, Inventory, and Persona Compendium.

---

## 🔜 Upcoming Commands (To-Do List)

Here is the list of commands planned for development, categorized by type.

### 🎭 Social & Fun

| Command | Type | Description | Priority |
| :--- | :--- | :--- | :--- |
| `/allout` | **Fun** | Trigger an *All-Out Attack* animation on a target user. | 🔥 High |
| `/jail` | **Security** | Send a user to the "Velvet Room Cell" (Timeout/Mute). | 🟡 Medium |
