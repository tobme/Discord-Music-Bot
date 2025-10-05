class QueueManager {
    constructor(musicManager) {
        this.musicManager = musicManager
        this.musicQueue = []
    }

    addQueue(songName) {
        const found = this.musicManager.musicList.find(element => element.name === songName)
        if (found && found.queueable && !this.musicQueue.includes(found.fileUrl)) {
            this.musicQueue.push(found.fileUrl)
            console.log("Add song to queue: ", found.fileUrl)
            return true
        }
        return false
    }

    getNextSong() {
        return this.musicQueue.length > 0 ? this.musicQueue.shift() : null
    }
}

module.exports = QueueManager