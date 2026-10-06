// Tells which audio system is using the bot's voice connection in a guild.
//
// A bot can be in only one voice channel per server, so the lofi radio
// (@discordjs/voice) and music (DisTube) can't run at the same time.
// Commands use these helpers to block the one that would cause a conflict.
import { getVoiceConnection } from "@discordjs/voice";

export function isMusicActive(guild) {
	return Boolean(guild.client.distube.voices.get(guild.id));
}

export function isLofiActive(guild) {
	return !isMusicActive(guild) && Boolean(getVoiceConnection(guild.id));
}