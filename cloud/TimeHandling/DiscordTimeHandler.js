const {User} = require('./UserManager.js')

class DiscordTimeHandler {
    constructor(userManager, timeTracker, Parse)
     {
        this.userManager = userManager;
        this.timeTracker = timeTracker;
        this.Parse = Parse;
    }

    async retrieveDiscordTimes() 
    {
        const timeInDiscord = this.Parse.Object.extend("TimeInDiscord");
        const query = new this.Parse.Query(timeInDiscord).limit(1000);
        let results = await query.find();

        console.log(`Finding users for time: ${results.length}`);
        results.forEach(obj => {
            let user = new User(
                obj.get('name'),
                Number(obj.get('time')),
                false,
                obj.id,
                new Date(),
                obj.get('sessionTime'),
                obj.get('leftTime'),
                obj.get('longestAway'),
                obj.get('timeObject'),
                obj.get('farmingObject')
            );
            this.userManager.addUser(obj.get('discordID'), user);
        });
    }

    isUserInDiscord(userID)
     {
        let user = this.userManager.getUser(userID);
        return user ? user.inDiscord : false;
    }

    userJoined(userID, userName) 
    {
        if (!this.userManager.userExists(userID))
        {
            this.userManager.addUser(userID, new User(userName, 0, true));
        }

        this.userManager.updateUser(userID, { userName, inDiscord: true, joinTime: new Date() });
        this.timeTracker.updateLongestAway(userID);
    }

    userAfk(userID)
     {
        this.timeTracker.updateTime(userID);
        this.userManager.updateUser(userID, { joinTime: new Date() });
    }

    backFromAfk(userID) 
    {
        this.timeTracker.updateFarmingTime(userID)

        this.userManager.updateUser(userID, { joinTime: new Date() });
    }

    userLeft(userID)
     {
        this.userManager.updateUser(userID, { inDiscord: false });
        this.timeTracker.updateTime(userID);
    }

    getDiscordTimes()
    {
        return this.userManager.users;
    }
}

module.exports = DiscordTimeHandler;