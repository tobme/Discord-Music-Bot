
const MusicInfo = require('./MusicInfo.js')

class SoundHandler {
    static musicList = new Array()
    static musicQueue = new Array()
    static shuffleQueue = new Array()

    static shuffleTheQueue()
    {
        this.shuffleQueue = this.musicList.map(({fileUrl}) => {
            return {fileUrl}
        })

        // Fisher-Yates Shuffle Algorithm
        for (let i = this.shuffleQueue.length - 1; i > 0; i--)
        {
            var k = Math.floor(Math.random() * i)
            var tmp = this.shuffleQueue[k]
            this.shuffleQueue[k] = this.shuffleQueue[i]
            this.shuffleQueue[i] = tmp
        }
    }

    static async retrieveSounds(Parse)
    {
        const sounds = Parse.Object.extend("Sounds");
        const query = new Parse.Query(sounds).limit(1000)

        let results = await query.find()
            
        console.log("Finding sounds: " + results.length)
                
        for (let i = 0; i < results.length; i++)
        {
            let thisObject = results[i];
            let file = thisObject.get('File')
            
            let name = file['_name'].toString()
            let approved = Boolean(thisObject.get('approved'))
            let queueable = Boolean(thisObject.get('queueable'))
            let objectId = thisObject["id"]
            let amountPlayed = thisObject.get("amountPlayed")
            let creatorName = thisObject.get("creator")

            if (approved && file !== undefined && file !== null)
            {
                name = name.substring(name.indexOf("_") + 1)
                name = name.substring(0, name.indexOf("."))

                const musicInfo = new MusicInfo(name, file["_url"], queueable, objectId, amountPlayed, creatorName)

                this.musicList.push(musicInfo)
            }
        }
    }

    static addSong(songName, fileUrl, queueable, objectId, creatorName)
    {
        const found = this.musicList.find(element => element.name === songName)

        if (found === undefined)
        {
            console.log("Adding file: " + songName)
            const musicInfo = new MusicInfo(songName, fileUrl, queueable, objectId, 0, creatorName)
            this.musicList.push(musicInfo)
        }
        else
        {
            console.log("Updating file: " + songName)
            found.name = songName
            found.fileUrl = fileUrl
            found.queueable = queueable
            found.objectId = objectId
            found.creatorName = creatorName
        }
    }

    static removeSong(songName)
    {
        const found = this.musicList.find(element => element.name === songName)

        if (found !== undefined)
        {
            console.log("Removing file: " + songName)
            const index = this.musicList.indexOf(found)
            this.musicList.splice(index, 1);
        }
    }

    static async addQueue(songName)
    {
        const found = this.musicList.find(element => element.name === songName)
      	
        const queued = this.musicQueue.find(element => element === found.fileUrl)
        
        if (found !== undefined && queued === undefined && Boolean(found["queueable"]))
        {
            this.musicQueue.push(found.fileUrl)
            console.log("Add song to queue: ", found.fileUrl)
            return true
        }
        return false
    }

    static getNextSong(Parse)
    {
        let song
        if (this.musicQueue.length === 0)
        {
           if (Math.random() < 0.2)
           {
                
                // Get random song
                song = this.musicList[Math.floor(Math.random() * this.musicList.length)].fileUrl
           }
           else
           {
                if (this.shuffleQueue.length === 0)
                {
                    this.shuffleTheQueue()
                }

                // Get random song
                song = this.shuffleQueue.shift().fileUrl
           }
        }
        else
        {
            song = this.musicQueue.shift()
        }

        this.updateSongCounter(song, Parse)
        return song
    }

    static updateSongCounter(fileUrl,Parse)
    {
        const found = this.musicList.find(element => element.fileUrl === fileUrl)

        if (found !== undefined)
        {
            found.amountPlayed++

            let sounds
        	       
            try
            {
               sounds = new Parse.Object("Sounds");
            }
            catch(error)
            {
                  console.log("Failed to parse Sounds")
                  return
            }

            if (found.objectId !== null)
            {
                sounds.set('objectId', found.objectId);
            }

            sounds.set("amountPlayed", Number(found.amountPlayed))
         
            try{
               //Save the Object
               sounds.save().then(result => {
                console.log("Updating Song %s to %d", fileUrl, found.amountPlayed)
               });
               
             }catch(error){
                console.log('Failed to update object, with error code: ' + error.message);
             }
        }
    }
}

module.exports = SoundHandler