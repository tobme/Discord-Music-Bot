const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType, entersState} = require("@discordjs/voice")

class ChannelManager
{
    constructor(playBackManger)
    {
        this.player = createAudioPlayer();
        this.playing = false
        this.playBackManger = playBackManger

        this.player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
            playing = false
        });
    
        this.player.on(AudioPlayerStatus.Playing, () => {
            playing = true
        });
    }

    playFile(channel)
    {
        console.log("CHA")
        const fileURL = this.playBackManger.getNextSong()

        console.log("CHA2")

        const resource = createAudioResource(fileURL, { inlineVolume: true });
        player.play(resource);


        entersState(player, AudioPlayerStatus.Playing, 5e3);

        connection = this.connectToChannel(channel)
        connection.subscribe(this.player)
    }

    connectToChannel(channel) {
        const connection = joinVoiceChannel({
            channelId: channel.channelId,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        try {
            entersState(connection, VoiceConnectionStatus.Ready, 30e3);
            return connection;
        } catch (error) {
            connection.destroy();
            throw error;
        }
    }
}

module.exports = ChannelManager