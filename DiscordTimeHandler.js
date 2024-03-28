class User {
    constructor(username, time, objectId, sessionTime, leftTime, longestAway, timeObject, farmingObject) {
        this.userName = username
        this.time = time,
        this.inDiscord = false
        this.objectId = objectId
        this.joinTime = new Date()
        this.sessionTime = sessionTime
        this.leftTime = leftTime
        this.longestAway = longestAway
        this.timeObject = timeObject
        this.farmingObject = farmingObject
    }
}

class DiscordTimeHandler {

    static usersDict = new Object()

    static async retrieveDiscordTimes(Parser)
    {
        DiscordTimeHandler.usersDict = new Object()

        const timeInDiscord = Parser.Object.extend("TimeInDiscord");
        const query = new Parser.Query(timeInDiscord).limit(1000)

        let results = await query.find()
        
        console.log("Finding users for time: " + results.length)
        
        for (let i = 0; i < results.length; i++)
        {
            let thisObject = results[i];
            let objectId = thisObject["id"]
            let discordID = thisObject.get('discordID')
            let time = Number(thisObject.get('time'))
            let name = thisObject.get('name')
            let sessionTime = thisObject.get('sessionTime')
            let leftTime = thisObject.get('leftTime')
            let longestAway = thisObject.get('longestAway')
            let timeObject = thisObject.get('timeObject')
            let farmingObject = thisObject.get('farmingObject')
            
            const tmpUser = new User(name, time , objectId, sessionTime, leftTime, longestAway, timeObject, farmingObject)

            DiscordTimeHandler.usersDict[discordID] = tmpUser
        }
    }

    static isUserInDiscord(userId)
    {
        return DiscordTimeHandler.usersDict[userId].inDiscord
    }

    static userJoined(userID, userName, Parse)
    {
        if (!DiscordTimeHandler.usersDict.hasOwnProperty(userID))
        {
            // New user joined that isn't saved
            DiscordTimeHandler.usersDict[userID] = new User(userName, 0, null, 0, "-1", 0)
        }
        else
        {
            // Saved user joined
            DiscordTimeHandler.usersDict[userID].userName = userName
            DiscordTimeHandler.usersDict[userID].inDiscord = true
            DiscordTimeHandler.usersDict[userID].joinTime = new Date()
        }

        DiscordTimeHandler.updateLongestAway(userID, Parse)
    }

    static updateLongestAway(userID, Parse) 
    {
        // Update longest away
        let leftTime = DiscordTimeHandler.usersDict[userID].leftTime

        if (leftTime !== "-1")
        {
            
            leftTime = new Date(leftTime)
            
            let currentTime = new Date()
            
            let timeSinceLeft = currentTime - leftTime
            
            timeSinceLeft /= 1000 * 60 // min      
            timeSinceLeft = Math.round(timeSinceLeft)
            
            DiscordTimeHandler.usersDict[userID]["leftTime"] = currentTime.toISOString()
            
            if (timeSinceLeft > Number(DiscordTimeHandler.usersDict[userID].longestAway))
            {
                let timeInDiscord
                    
                try
                {
                    timeInDiscord = new Parse.Object("TimeInDiscord");
                }
                catch(error)
                {
                    console.log("Failed to parse TimeInDiscord", error)
                    return
                }
                
                if (DiscordTimeHandler.usersDict[userID].objectId !== null)
                {
                    timeInDiscord.set('objectId', DiscordTimeHandler.usersDict[userID].objectId);
                }
                                
                timeInDiscord.set("longestAway", timeSinceLeft)
                
                // Update to be sure =)
                let leftTime = (new Date()).toISOString();
                DiscordTimeHandler.usersDict[userID].leftTime = leftTime
                DiscordTimeHandler.usersDict[userID].longestAway = timeSinceLeft.toString()
                
                timeInDiscord.set("leftTime", DiscordTimeHandler.usersDict[userID].leftTime)
                
                try{
                    //Save the Object
                    timeInDiscord.save().then(result => {
                        console.log("Updating user with id: " + userID)
                });
                
                }catch(error){
                    console.log('Failed to update object, with error code: ' + error.message);
                }
            }
        }
    }

    static updateTime(userID, Parse)
    {
        let user = DiscordTimeHandler.usersDict[userID]
        
        let timeInDiscord
        
        try
        {
            timeInDiscord = new Parse.Object("TimeInDiscord");
        }
        catch(error)
        {
            console.log("Failed to parse TimeInDiscord ", error)
            return
        }
        
        const currentTime = new Date()
        
        let elapsedTime = currentTime - Number(user.joinTime) // ms
        elapsedTime /= 1000 * 60 // min
        elapsedTime = Math.round(elapsedTime)
        
        if (elapsedTime === 0) // no need to update if user just joined
        {
            return
        }
        
        let sessionTime = Number(user.sessionTime)
        
        let sessionDeltaTime = currentTime - Number(user.joinTime)
        
        sessionDeltaTime /= 1000 * 60 // min
        
        sessionDeltaTime = Math.round(sessionDeltaTime)
        
        if (sessionDeltaTime > sessionTime)
        {
            DiscordTimeHandler.usersDict[userID].sessionTime = sessionDeltaTime
        }
        
        let leftTime = (new Date()).toISOString();
        DiscordTimeHandler.usersDict[userID].leftTime = leftTime
        
        console.log("Time: " + elapsedTime)

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        if (!Object.hasOwn(DiscordTimeHandler.usersDict[userID].timeObject, yyyy))
        {
            DiscordTimeHandler.usersDict[userID].timeObject[yyyy] = new Object()
        }

        if (!Object.hasOwn(DiscordTimeHandler.usersDict[userID].timeObject[yyyy], mm))
        {
            DiscordTimeHandler.usersDict[userID].timeObject[yyyy][mm] = new Object()
        }

        if (!Object.hasOwn(DiscordTimeHandler.usersDict[userID].timeObject[yyyy][mm], dd))
        {
            DiscordTimeHandler.usersDict[userID].timeObject[yyyy][mm][dd] = elapsedTime
        }
        else
        {
            DiscordTimeHandler.usersDict[userID].timeObject[yyyy][mm][dd] += elapsedTime
        } 
        
        if (user["objectId"] === null) // Create new instance
        {
            timeInDiscord.set("timeObject", DiscordTimeHandler.usersDict[userID].timeObject);
            timeInDiscord.set("name", user.userName);
            timeInDiscord.set("discordID", userID);
            timeInDiscord.set("sessionTime", user.sessionTime)
            timeInDiscord.set("leftTime", user.leftTime)
            
            try{
                //Save the Object
                timeInDiscord.save().then(result => {
                    DiscordTimeHandler.usersDict[userID].objectId = result.id
                    console.log("Created new user with id: " + result.id)
                });
                

            }catch(error){
                console.log('Failed to create new object, with error code: ' + error.message);
                return
            }
        }
        else // Update current objectId
        {
            console.log("Updating user: " + user.userName)
            //set the object
            timeInDiscord.set('objectId', user.objectId);
            //define the new valuess
            timeInDiscord.set("timeObject", DiscordTimeHandler.usersDict[userID].timeObject);
            timeInDiscord.set("name", user.userName);
            timeInDiscord.set("sessionTime", user.sessionTime)
            timeInDiscord.set("leftTime", user.leftTime)
            
            try{
            //Save the Object
            timeInDiscord.save().then(result => {
                console.log("Updating user with id: " + user.objectId)
                return
            });
            
            }catch(error){
                console.log('Failed to update object, with error code: ' + error.message);
                return
            }
        }
            
    }

    static userAfk(userId, Parse)
    {
        this.updateTime(userId, Parse)

        DiscordTimeHandler.usersDict[userId].joinTime = new Date()
    }

    static backFromAfk(userID, Parse)
    {
        let user = DiscordTimeHandler.usersDict[userID]
        
        let timeInDiscord
        
        try
        {
            timeInDiscord = new Parse.Object("TimeInDiscord");
        }
        catch(error)
        {
            console.log("Failed to parse TimeInDiscord ", error)
            return
        }

        const currentTime = new Date()
        
        let elapsedTime = currentTime - Number(user.joinTime) // ms
        elapsedTime /= 1000 * 60 // min
        elapsedTime = Math.round(elapsedTime)
        
        if (elapsedTime === 0) // no need to update if user just went afk
        {
            return
        }

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        if (!Object.hasOwn(DiscordTimeHandler.usersDict[userID].farmingObject, yyyy))
        {
            DiscordTimeHandler.usersDict[userID].farmingObject[yyyy] = new Object()
        }

        if (!Object.hasOwn(DiscordTimeHandler.usersDict[userID].farmingObject[yyyy], mm))
        {
            DiscordTimeHandler.usersDict[userID].farmingObject[yyyy][mm] = new Object()
        }

        if (!Object.hasOwn(DiscordTimeHandler.usersDict[userID].farmingObject[yyyy][mm], dd))
        {
            DiscordTimeHandler.usersDict[userID].farmingObject[yyyy][mm][dd] = elapsedTime
        }
        else
        {
            DiscordTimeHandler.usersDict[userID].farmingObject[yyyy][mm][dd] += elapsedTime
        } 

        if (user["objectId"] === null) // Create new instance
        {
            timeInDiscord.set("farmingObject", DiscordTimeHandler.usersDict[userID].farmingObject);
            timeInDiscord.set("name", user.userName);
            timeInDiscord.set("discordID", userID);
            
            try{
                //Save the Object
                timeInDiscord.save().then(result => {
                    DiscordTimeHandler.usersDict[userID].objectId = result.id
                    console.log("Created new user with id: " + result.id)
                });
                

            }catch(error){
                console.log('Failed to create new object, with error code: ' + error.message);
                return
            }
        }
        else // Update current objectId
        {
            console.log("Updating user: " + user.userName)
            //set the object
            timeInDiscord.set('objectId', user.objectId);
            //define the new valuess
            timeInDiscord.set("farmingObject", DiscordTimeHandler.usersDict[userID].farmingObject);
            timeInDiscord.set("name", user.userName);
            
            try{
            //Save the Object
            timeInDiscord.save().then(result => {
                console.log("Updating user with id: " + user.objectId)
                return
            });
            
            }catch(error){
                console.log('Failed to update object, with error code: ' + error.message);
                return
            }
        }

        DiscordTimeHandler.usersDict[userID].joinTime = new Date()
    }
    
    static userLeft(userID, Parse)
    {
        DiscordTimeHandler.usersDict[userID].inDiscord = false

        this.updateTime(userID, Parse)
    }
}

module.exports = DiscordTimeHandler

