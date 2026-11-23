import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from "discord.js";
import { RepeatMode } from "distube";
import logger from "#utils/logger.js";
import { isLofiActive } from "#utils/audioState.js";
import { resolveSongQuery } from "#utils/musicSearch.js";

export default {
	data: new SlashCommandBuilder()
		.setName("music")
		.setDescription("Manage music streaming")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("play")
				.setDescription("Play a song or playlist from external sources")
				.addStringOption((option) =>
					option
						.setName("query")
						.setDescription("Link or name of the song")
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("stop").setDescription("Stop the music and disconnect the bot"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("join").setDescription("Join your voice channel"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("queue").setDescription("Show the current queue"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("nowplaying").setDescription("Show the current song"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("skip").setDescription("Skip the current song"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("pause").setDescription("Pause the playback"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("resume").setDescription("Resume the playback"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("volume")
				.setDescription("Set the volume (0-100)")
				.addIntegerOption((option) =>
					option
						.setName("level")
						.setDescription("Volume level")
						.setRequired(true)
						.setMinValue(0)
						.setMaxValue(100),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("loop").setDescription("Toggle loop (off → queue → song)"),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("shuffle").setDescription("Toggle shuffle"),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("seek")
				.setDescription("Jump to a position (seconds)")
				.addIntegerOption((option) =>
					option
						.setName("seconds")
						.setDescription("Position in seconds")
						.setRequired(true)
						.setMinValue(0),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Remove a song from the queue (1 = next song)")
				.addIntegerOption((option) =>
					option
						.setName("position")
						.setDescription("Position in the queue")
						.setRequired(true)
						.setMinValue(1),
				),
		),

	async execute(interaction, { theme }) {
		const sub = interaction.options.getSubcommand();
		const { distube } = interaction.client;
		const queue = distube.getQueue(interaction.guildId);

		// Subcommands that require the user to be in a voice channel
		if (sub === "play" || sub === "join") {
			const voiceChannel = interaction.member.voice.channel;
			if (!voiceChannel) {
				return interaction.reply({
					content: theme.t("music.notInVoice"),
					flags: MessageFlags.Ephemeral,
				});
			}
			if (isLofiActive(interaction.guild)) {
				return interaction.reply({
					content: theme.t("music.lofiActive"),
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		// Subcommands that require an active queue
		const queueRequired = [
			"stop", "queue", "nowplaying", "skip", "pause", "resume",
			"volume", "loop", "shuffle", "seek", "remove",
		];
		if (queueRequired.includes(sub) && !queue) {
			return interaction.reply({
				content: theme.t("music.nothingPlaying"),
				flags: MessageFlags.Ephemeral,
			});
		}

		switch (sub) {
			case "play": {
				const voiceChannel = interaction.member.voice.channel;
				const rawQuery = interaction.options.getString("query");
				await interaction.reply(theme.t("music.loading", { query: rawQuery }));

				// Resolve plain-text queries to a clean "Artist - Title" via the
				// iTunes catalog, so YouTube matches the right song. URLs pass through.
				const resolved = await resolveSongQuery(rawQuery);

				try {
					await distube.play(voiceChannel, resolved.query, {
						textChannel: interaction.channel,
						member: interaction.member,
					});

					const message = resolved.duration
						? theme.t("music.queuedWithMeta", {
								title: resolved.title,
								artist: resolved.artist,
								duration: resolved.duration,
							})
						: theme.t("music.queued", { query: resolved.query });
					await interaction.editReply(message);
				} catch (error) {
					logger.error(`Music play failed for "${resolved.query}": ${error.message}`);
					await interaction.editReply(theme.t("music.notFound"));
				}
				break;
			}

			case "join": {
				const voiceChannel = interaction.member.voice.channel;
				await distube.voices.join(voiceChannel);
				await interaction.reply(theme.t("music.joined", { channel: voiceChannel.name }));
				break;
			}

			case "stop": {
				queue.stop();
				distube.voices.leave(interaction.guildId);
				await interaction.reply(theme.t("music.stopped"));
				break;
			}

			case "queue": {
				const songs = queue.songs;
				const listing = songs
					.slice(0, 11)
					.map((song, i) => `\`${i + 1}.\` ${song.name} — \`${song.formattedDuration}\``)
					.join("\n");

				const embed = new EmbedBuilder()
					.setTitle(theme.t("music.queueTitle"))
					.setColor(theme.color)
					.setDescription(
						`${theme.t("music.queueNow", { name: songs[0].name })}\n\n${listing}`,
					);

				await interaction.reply({ embeds: [embed] });
				break;
			}

			case "nowplaying": {
				const song = queue.songs[0];
				await interaction.reply(
					theme.t("music.nowPlaying", {
						name: song.name,
						duration: song.formattedDuration,
					}),
				);
				break;
			}

			case "skip": {
				const skipped = queue.songs[0];
				await queue.skip();
				await interaction.reply(theme.t("music.skipped", { name: skipped.name }));
				break;
			}

			case "pause": {
				if (!queue.paused) await queue.pause();
				await interaction.reply(theme.t("music.paused"));
				break;
			}

			case "resume": {
				if (queue.paused) await queue.resume();
				await interaction.reply(theme.t("music.resumed"));
				break;
			}

			case "volume": {
				const level = interaction.options.getInteger("level");
				queue.setVolume(level);
				await interaction.reply(theme.t("music.volumeSet", { volume: level }));
				break;
			}

			case "loop": {
				const modes = [RepeatMode.DISABLED, RepeatMode.QUEUE, RepeatMode.SONG];
				const next = modes[(modes.indexOf(queue.repeatMode) + 1) % modes.length];
				queue.setRepeatMode(next);

				const key =
					next === RepeatMode.SONG ? "music.loopSong"
					: next === RepeatMode.QUEUE ? "music.loopQueue"
					: "music.loopOff";
				await interaction.reply(theme.t(key));
				break;
			}

			case "shuffle": {
				await queue.shuffle();
				await interaction.reply(theme.t("music.shuffleOn"));
				break;
			}

			case "seek": {
				const seconds = interaction.options.getInteger("seconds");
				await queue.seek(seconds);
				await interaction.reply(theme.t("music.seekDone", { seconds }));
				break;
			}

			case "remove": {
				const position = interaction.options.getInteger("position");
				if (position >= queue.songs.length) {
					return interaction.reply({
						content: theme.t("music.removeInvalid"),
						flags: MessageFlags.Ephemeral,
					});
				}

				const removed = queue.songs[position];
				queue.remove(position);
				await interaction.reply(theme.t("music.removed", { name: removed.name }));
				break;
			}
		}
	},
};
