const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType, entersState} = require("@discordjs/voice")

class ChannelManager
{
    constructor(playBackManger)
    {
        this.player = createAudioPlayer();
        this.playing = false
        this.playBackManger = playBackManger
        this.playing = false
        this.connection = null

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.connection.destroy();
            this.playing = false
        });
    
        this.player.on(AudioPlayerStatus.Playing, () => {
            this.playing = true
        });
    }

    playFile(channel)
    {
        if (this.playing) return;
        
        const fileURL = this.playBackManger.getNextSong()

        const resource = createAudioResource(fileURL, { inlineVolume: true });
        this.player.play(resource);


        entersState(this.player, AudioPlayerStatus.Playing, 5e3);

        this.connection = this.connectToChannel(channel)
        this.connection.subscribe(this.player)
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