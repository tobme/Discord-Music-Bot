class ShuffleManager {
    constructor(musicManager) {
        this.musicManager = musicManager
        this.shuffleQueue = []
    }

    shuffleTheQueue() {
        this.shuffleQueue = this.musicManager.musicList.map(({ fileUrl }) => ({ fileUrl }))

        for (let i = this.shuffleQueue.length - 1; i > 0; i--) {
            let k = Math.floor(Math.random() * i);
            let tmp = this.shuffleQueue[k];
            this.shuffleQueue[k] = this.shuffleQueue[i];
            this.shuffleQueue[i] = tmp;
        }
    }

    getShuffledSong() {
        if (this.shuffleQueue.length === 0) {
            this.shuffleTheQueue()
        }
        return this.shuffleQueue.length > 0 ? this.shuffleQueue.shift().fileUrl : null
    }
}

module.exports = ShuffleManager