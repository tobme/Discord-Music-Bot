
class MusicInfo {
    constructor(name, fileUrl, queueable, objectId, amountPlayed, creatorName, category) {
        this.name = name
        this.fileUrl = fileUrl
        this.queueable= queueable
        this.objectId = objectId
        this.amountPlayed = amountPlayed
        this.updated = false
        this.creatorName = creatorName
        this.category = category
    }
}

module.exports = MusicInfo