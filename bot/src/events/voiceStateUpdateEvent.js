// Reacts when the bot's voice channel becomes empty or gets listeners again.
//
// - Music (DisTube): leaves the channel after a short grace period.
// - Lofi radio (@discordjs/voice): the bot stays in the channel 24/7,
//   but the player is paused while nobody is listening, to save CPU and bandwidth.
import { Events } from "discord.js";
import { getVoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
import logger from "#utils/logger.js";
import { isLofiActive, isMusicActive } from "#utils/audioState.js";

const EMPTY_CHANNEL_TIMEOUT_MS = 60_000;

// guildId → timer started when the music channel became empty
const leaveTimers = new Map();

function cancelTimer(guildId) {
	clearTimeout(leaveTimers.get(guildId));
	leaveTimers.delete(guildId);
}

function countHumans(channel) {
	return channel.members.filter((member) => !member.user.bot).size;
}

// The lofi player, if the lofi radio is the one using the voice connection
function getLofiPlayer(guild) {
	if (!isLofiActive(guild)) return null;
	return getVoiceConnection(guild.id)?.state.subscription?.player ?? null;
}

// -----------------------------------------------------------------------------
// LOFI: pause when empty, resume when someone joins
// -----------------------------------------------------------------------------
function handleLofi(guild, player, isEmpty) {
	if (isEmpty && player.state.status === AudioPlayerStatus.Playing) {
		player.pause();
		logger.debug(`Lofi paused in guild ${guild.id}: nobody is listening`);
	} else if (!isEmpty && player.state.status === AudioPlayerStatus.Paused) {
		player.unpause();
		logger.debug(`Lofi resumed in guild ${guild.id}`);
	}
}

// -----------------------------------------------------------------------------
// MUSIC: leave after a grace period
// -----------------------------------------------------------------------------
function handleMusic(guild, isEmpty) {
	if (!isEmpty) {
		cancelTimer(guild.id);
		return;
	}

	if (leaveTimers.has(guild.id)) return;

	const timer = setTimeout(async () => {
		leaveTimers.delete(guild.id);

		// Check again: someone may have joined in the meantime
		const channel = guild.members.me?.voice.channel;
		if (!channel || countHumans(channel) > 0) return;

		const { distube } = guild.client;
		await distube
			.getQueue(guild.id)
			?.stop()
			.catch((error) =>
				logger.warn(`Could not stop music queue: ${error.message}`),
			);
		distube.voices.leave(guild.id);
		logger.info(`Left empty voice channel in guild ${guild.id}`);
	}, EMPTY_CHANNEL_TIMEOUT_MS);

	leaveTimers.set(guild.id, timer);
}

export default {
	name: Events.VoiceStateUpdate,
	execute(oldState) {
		const { guild } = oldState;
		const botChannel = guild.members.me?.voice.channel;

		// The bot is not in a voice channel: nothing to watch
		if (!botChannel) {
			cancelTimer(guild.id);
			return;
		}

		const isEmpty = countHumans(botChannel) === 0;
		const lofiPlayer = getLofiPlayer(guild);

		if (lofiPlayer) {
			handleLofi(guild, lofiPlayer, isEmpty);
		} else if (isMusicActive(guild)) {
			handleMusic(guild, isEmpty);
		}
	},
};
