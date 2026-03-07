const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType, entersState} = require("@discordjs/voice")
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('node:stream/promises');

class ChannelManager
{
    constructor(playBackManger)
    {
        this.player = createAudioPlayer({
                behaviors: {
                    noSubscriber: 'play' 
                }
            });
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

    async playFile(channel)
    {
        if (this.playing) return;

        this.connection = await this.connectToChannel(channel)

        try {
            const fileURL = this.playBackManger.getNextSong()

            if (!fileURL) {
                this.connection.destroy();
                return;
            }

            await entersState(this.connection, VoiceConnectionStatus.Ready, 20_000);

            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
            const safeFileName = new URL(fileURL).pathname.replace(/[:\\/]/g, "_");
            const localPath = path.join(cacheDir, safeFileName);

            if (!fs.existsSync(localPath)) 
            {
                // Download once if it doesn't exist
                const response = await axios.get(fileURL, { responseType: 'stream' });
                await pipeline(response.data, fs.createWriteStream(localPath));
            }

            this.connection.subscribe(this.player)

            const resource = createAudioResource(localPath, { inlineVolume: false });
            this.player.play(resource);

            await entersState(this.player, AudioPlayerStatus.Playing, 5e3);
        }
        catch (error) 
        {
            console.error("Failed to connect or play:", error);
            this.connection?.destroy();
        }

    }

    async connectToChannel(channel) {
        const connection = joinVoiceChannel({
            channelId: channel.channelId,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
            return connection;
        } catch (error) {
            connection.destroy();
            throw error;
        }
    }
}

module.exports = ChannelManager