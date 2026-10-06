import { getGuildTheme } from "#settings/guildSettings.js";

export default {
	name: "playSong",
	distube: true,
	execute(queue, song) {
		const theme = getGuildTheme(queue.id);
		queue.textChannel.send(
			theme.t("music.nowPlaying", { name: song.name, duration: song.formattedDuration }),
		);
	},
};
