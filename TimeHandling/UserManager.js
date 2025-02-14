class User {
    constructor(username, time = 0, inDiscord = false, objectId = null, joinTime = new Date(), sessionTime = 0, leftTime = "-1", longestAway = 0, timeObject = {}, farmingObject = {}) {
        this.userName = username;
        this.time = time;
        this.inDiscord = inDiscord;
        this.objectId = objectId;
        this.joinTime = joinTime;
        this.sessionTime = sessionTime;
        this.leftTime = leftTime;
        this.longestAway = longestAway;
        this.timeObject = timeObject;
        this.farmingObject = farmingObject;
    }
}

class UserManager 
{
    constructor() 
    {
        this.users = {};
    }

    addUser(userID, user) 
    {
        this.users[userID] = user;
    }

    getUser(userID)
     {
        return this.users[userID] || null;
    }

    userExists(userID) 
    {
        return this.users.hasOwnProperty(userID);
    }

    updateUser(userID, updates)
    {
        if (this.userExists(userID)) {
            Object.assign(this.users[userID], updates);
        }
    }
}

module.exports = {UserManager, User};