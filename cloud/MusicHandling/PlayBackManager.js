class PlaybackManager {
    constructor(musicManager, queueManager, shuffleManager, Parse) {
        this.musicManager = musicManager
        this.queueManager = queueManager
        this.shuffleManager = shuffleManager
        this.Parse = Parse
    }

    getNextSong() {
        let song = this.queueManager.getNextSong()

        if (!song) {
            song = Math.random() < 0.2
                ? this.musicManager.musicList[Math.floor(Math.random() * this.musicManager.musicList.length)].fileUrl
                : this.shuffleManager.getShuffledSong()
        }

        this.updateSongCounter(song)
        return song
    }

    addQueue(songName)
    {
        return this.queueManager.addQueue(songName)
    }

    addSong(songName, fileUrl, queueable, objectId, creatorName)
    {
        this.musicManager.addSong(songName, fileUrl, queueable, objectId, creatorName)
    }

    removeSong(songName)
    {
        this.musicManager.removeSong(songName)
    }

    updateSongCounter(fileUrl) {
        const found = this.musicManager.musicList.find(element => element.fileUrl === fileUrl)
        if (!found) return

        found.amountPlayed++

        let sounds = new this.Parse.Object("Sounds")
        sounds.set('objectId', found.objectId)
        sounds.set("amountPlayed", found.amountPlayed)

        sounds.save()
            .then(() => console.log("Updated Song %s to %d", fileUrl, found.amountPlayed))
            .catch(error => console.log('Failed to update object: ' + error.message))
    }

    getMusicList()
    {
        return this.musicManager.musicList;
    }
}

module.exports = PlaybackManager