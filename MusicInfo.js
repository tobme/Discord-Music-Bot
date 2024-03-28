
class MusicInfo {
    constructor(name, fileUrl, queueable, objectId, amountPlayed, creatorName) {
        this.name = name
        this.fileUrl = fileUrl
        this.queueable= queueable
        this.objectId = objectId
        this.amountPlayed = amountPlayed
        this.updated = false
        this.creatorName = creatorName
    }
}

module.exports = MusicInfo