const DiscordTimeHandler = require('./DiscordTimeHandler.js')

const {UserManager} = require('./UserManager.js')
const TimeTracker = require('./TimeTracker.js')

function createDiscordTimeHandler(Parse)
{
    const userManager = new UserManager()

    const timeTracker = new TimeTracker(userManager, Parse)
    
    const discordTimeHandler = new DiscordTimeHandler(userManager, timeTracker, Parse)

    discordTimeHandler.retrieveDiscordTimes()
    
    return discordTimeHandler
}

module.exports = {createDiscordTimeHandler};