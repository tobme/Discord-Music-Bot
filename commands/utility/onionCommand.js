
const { SlashCommandBuilder } = require('discord.js')
const TimeHandler = require('../../DiscordTimeHandler.js');
const {convertToTime} = require('../../TimeConverter.js')


async function getLongestAway(user)
{
    console.log("Is in discord: " + Boolean(user.InDiscord))
    
    // If user is in discord then the updated longest away is always largest
    if (Boolean(user.InDiscord))
    {
        return user.longestAway
    }
    
    let leftTime = user.leftTime
    
    // Never have left disc
    if (leftTime === "-1")
    {
        return user["longestAway"]
    }
    
    leftTime = new Date(leftTime)
    
    let currentTime = new Date()
    
    let timeSinceLeft = currentTime - leftTime
    
    timeSinceLeft /= 1000 * 60 // min
        
    timeSinceLeft = Math.round(timeSinceLeft)
    
    if (timeSinceLeft > Number(user.longestAway))
    {
        return timeSinceLeft
    }
    else
    {
        return user.longestAway
    }
}

function getTotalTime(user)
{
    let time = user.time

    for (const [key, years] of Object.entries(user.timeObject))
    {
        for (const [key2, month] of Object.entries(years))
        {
            for (const [key2, day] of Object.entries(month))
            {
                time += Number(day)
            }
        }
    }

    return time
}

module.exports = {
    data :
    new SlashCommandBuilder()
    .setName('onionscore')
    .setDescription('Lists all the onion'),

    async execute(interaction) {

        var personsInDiscord = TimeHandler.usersDict
    
        var out = new Array()
                  
        for (const person in personsInDiscord)
        {
            let time = getTotalTime(personsInDiscord[person])
            out.push( {"name": personsInDiscord[person].userName, "InDiscord": personsInDiscord[person].InDiscord, "time": time, "sessionTime": personsInDiscord[person].sessionTime, "leftTime": personsInDiscord[person].leftTime, "longestAway": personsInDiscord[person].longestAway} )
        }
        
        out.sort(function(a, b){return Number(b.time) - Number(a.time) });
        
        var string = " P |    Name    |    Time     | sessionTime  | Longest Away\n"
        string    += '------------------------------------------------------------\n'
        
        for (let i = 0; i < out.length; i++)
        {
          string += String(i+1).padEnd(2) + " | "
          
          let tmpName = out[i].name.padEnd(10, " ")
          string += tmpName + "   "
          
          let tmpTime = convertToTime(out[i].time).padEnd(11, " ")
          string += tmpTime + "   "
          
          let tmpSessionTime = convertToTime(out[i].sessionTime) .padEnd(11, " ")
          string += tmpSessionTime + "   "
          
          let tmpLongestAwayStr = await getLongestAway(out[i])
          tmpLongestAwayStr = Number(tmpLongestAwayStr)
          let tmpLongestAway = tmpLongestAwayStr !== 0 ? convertToTime(tmpLongestAwayStr).padEnd(11, " ") : String("No Data").padEnd(11, " ")
          string += tmpLongestAway + '\n'
        }
        
        if (string != '')
            await interaction.reply({"content": string, ephemeral: false});
    }
}