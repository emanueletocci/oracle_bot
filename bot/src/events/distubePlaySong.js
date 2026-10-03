export default {
    name: "playSong",
    distube: true, 
    execute(queue, song) {
        queue.textChannel.send(
            `🎵 **Take Over!** Infiltrazione riuscita. In riproduzione: \`${song.name}\` - \`${song.formattedDuration}\``
        );
    },
};