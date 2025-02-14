const MusicInfo = require('./MusicInfo.js')

class MusicManager {
    constructor() {
        this.musicList = []
    }

    async retrieveSounds(Parse) {
        const sounds = Parse.Object.extend("Sounds")
        const query = new Parse.Query(sounds).limit(1000)

        let results = await query.find()
        console.log("Finding sounds: " + results.length)

        results.forEach(thisObject => {
            let file = thisObject.get('File')
            let name = file ? file['_name'].toString() : ''
            let approved = Boolean(thisObject.get('approved'))
            let queueable = Boolean(thisObject.get('queueable'))
            let objectId = thisObject.id
            let amountPlayed = thisObject.get("amountPlayed")
            let creatorName = thisObject.get("creator")

            if (approved && file) {
                name = name.substring(name.indexOf("_") + 1, name.lastIndexOf("."))

                const musicInfo = new MusicInfo(name, file["_url"], queueable, objectId, amountPlayed, creatorName)
                this.musicList.push(musicInfo)
            }
        })
    }

    addSong(songName, fileUrl, queueable, objectId, creatorName) {
        const found = this.musicList.find(element => element.name === songName)

        if (!found) {
            console.log("Adding file: " + songName)
            this.musicList.push(new MusicInfo(songName, fileUrl, queueable, objectId, 0, creatorName))
        } else {
            console.log("Updating file: " + songName)
            Object.assign(found, { name: songName, fileUrl, queueable, objectId, creatorName })
        }
    }

    removeSong(songName) {
        const index = this.musicList.findIndex(element => element.name === songName)
        if (index !== -1) {
            console.log("Removing file: " + songName)
            this.musicList.splice(index, 1)
        }
    }
}

module.exports = MusicManager