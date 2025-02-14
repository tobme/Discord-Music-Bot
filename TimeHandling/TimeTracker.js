class TimeTracker {
    constructor(userManager, Parse) {
        this.userManager = userManager;
        this.Parse = Parse;
    }

    updateLongestAway(userID)
    {
        let user = this.userManager.getUser(userID);
        if (!user || user.leftTime === "-1") return;

        let leftTime = new Date(user.leftTime);
        let currentTime = new Date();
        let timeSinceLeft = Math.round((currentTime - leftTime) / (1000 * 60)); // Convert to minutes

        user.leftTime = currentTime.toISOString();
        if (timeSinceLeft > Number(user.longestAway)) {
            user.longestAway = timeSinceLeft.toString();
            this.saveUserTime(userID, { longestAway: user.longestAway, leftTime: user.leftTime });
        }
    }

    updateTime(userID) 
    {
        let user = this.userManager.getUser(userID);
        if (!user) return;

        const currentTime = new Date();
        let elapsedTime = Math.round((currentTime - user.joinTime) / (1000 * 60)); // Convert to minutes
        if (elapsedTime === 0) return;

        user.sessionTime = Math.max(user.sessionTime, elapsedTime);
        user.leftTime = currentTime.toISOString();

        this.trackTimeObject(user.timeObject, elapsedTime);
        this.saveUserTime(userID, { timeObject: user.timeObject, sessionTime: user.sessionTime, leftTime: user.leftTime });
    }

    updateFarmingTime(userID)
    {
        let user = this.userManager.getUser(userID);
        if (!user) return;

        const currentTime = new Date();
        let elapsedTime = Math.round((currentTime - user.joinTime) / (1000 * 60)); // Convert to minutes
        if (elapsedTime === 0) return;

        this.trackTimeObject(user.farmingObject, elapsedTime);
        this.saveUserTime(userID, { farmingObject: user.farmingObject });
    }

    trackTimeObject(userObject, elapsedTime)
     {
        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let dd = String(today.getDate()).padStart(2, '0');

        if (!userObject.hasOwnProperty(yyyy)) userObject[yyyy] = {};
        if (!userObject[yyyy].hasOwnProperty(mm)) userObject[yyyy][mm] = {};
        userObject[yyyy][mm][dd] = (userObject[yyyy][mm][dd] || 0) + elapsedTime;
    }

    saveUserTime(userID, updates) 
    {
        let user = this.userManager.getUser(userID);
        if (!user) return;

        let timeInDiscord = new this.Parse.Object("TimeInDiscord");
        if (user.objectId) timeInDiscord.set('objectId', user.objectId);

        Object.entries(updates).forEach(([key, value]) => timeInDiscord.set(key, value));

        timeInDiscord.save()
            .then(result => {
                if (!user.objectId) user.objectId = result.id;
                console.log(`Updated user ${userID}`);
            })
            .catch(error => console.log('Failed to update object:', error.message));
    }
}

module.exports = TimeTracker;