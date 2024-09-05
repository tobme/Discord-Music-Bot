
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js')
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

        // 

        const selectYear = new StringSelectMenuBuilder()
            .setCustomId('year')
            .setPlaceholder('All')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('All')
                    .setValue('All'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('2024')
                    .setValue('2024'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('2025')
                    .setValue('2025'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('2026')
                    .setValue('2026'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('2027')
                    .setValue('2027'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('2028')
                    .setValue('2028'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('2029')
                    .setValue('2029'),
            );

        const selectMonth = new StringSelectMenuBuilder()
            .setCustomId('month')
            .setPlaceholder('All')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('All')
                    .setValue('All'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Januari')
                    .setValue('1'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Februari')
                    .setValue('2'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Mars')
                    .setValue('3'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('April')
                    .setValue('4'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Maj')
                    .setValue('5'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Juni')
                    .setValue('6'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Juli')
                    .setValue('7'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Augusti')
                    .setValue('8'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('September')
                    .setValue('9'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Oktober')
                    .setValue('10'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('November')
                    .setValue('11'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('December')
                    .setValue('12'),
            );

        const selectDay = new StringSelectMenuBuilder()
			.setCustomId('day')
			.setPlaceholder('All')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('All')
					.setValue('All'),
				new StringSelectMenuOptionBuilder()
					.setLabel('1')
					.setValue('1'),
				new StringSelectMenuOptionBuilder()
					.setLabel('2')
					.setValue('2'),
                new StringSelectMenuOptionBuilder()
					.setLabel('3')
					.setValue('3'),
                new StringSelectMenuOptionBuilder()
					.setLabel('4')
					.setValue('4'),
                new StringSelectMenuOptionBuilder()
					.setLabel('5')
					.setValue('5'),
                new StringSelectMenuOptionBuilder()
					.setLabel('6')
					.setValue('6'),
				new StringSelectMenuOptionBuilder()
					.setLabel('7')
					.setValue('7'),
				new StringSelectMenuOptionBuilder()
					.setLabel('8')
					.setValue('8'),
                new StringSelectMenuOptionBuilder()
					.setLabel('9')
					.setValue('9'),
                new StringSelectMenuOptionBuilder()
					.setLabel('10')
					.setValue('10'),
                new StringSelectMenuOptionBuilder()
					.setLabel('11')
					.setValue('11'),
                new StringSelectMenuOptionBuilder()
					.setLabel('12')
					.setValue('12'),
				new StringSelectMenuOptionBuilder()
					.setLabel('13')
					.setValue('13'),
				new StringSelectMenuOptionBuilder()
					.setLabel('14')
					.setValue('14'),
                new StringSelectMenuOptionBuilder()
					.setLabel('15')
					.setValue('15'),
                new StringSelectMenuOptionBuilder()
					.setLabel('16')
					.setValue('16'),
                new StringSelectMenuOptionBuilder()
					.setLabel('17')
					.setValue('17'),
                new StringSelectMenuOptionBuilder()
					.setLabel('18')
					.setValue('18'),
				new StringSelectMenuOptionBuilder()
					.setLabel('19')
					.setValue('19'),
				new StringSelectMenuOptionBuilder()
					.setLabel('20')
					.setValue('20'),
                new StringSelectMenuOptionBuilder()
					.setLabel('21')
					.setValue('21'),
                new StringSelectMenuOptionBuilder()
					.setLabel('22')
					.setValue('22'),
                    /*
                new StringSelectMenuOptionBuilder()
					.setLabel('23')
					.setValue('23'),
                new StringSelectMenuOptionBuilder()
					.setLabel('24')
					.setValue('24'),
				new StringSelectMenuOptionBuilder()
					.setLabel('25')
					.setValue('25'),
				new StringSelectMenuOptionBuilder()
					.setLabel('26')
					.setValue('26'),
                new StringSelectMenuOptionBuilder()
					.setLabel('27')
					.setValue('27'),
                new StringSelectMenuOptionBuilder()
					.setLabel('28')
					.setValue('28'),
                new StringSelectMenuOptionBuilder()
					.setLabel('29')
					.setValue('29'),
                new StringSelectMenuOptionBuilder()
					.setLabel('30')
					.setValue('30'),
                new StringSelectMenuOptionBuilder()
					.setLabel('31')
					.setValue('31'),
                    */
			);
        
        const row = new ActionRowBuilder().addComponents(selectYear);
        const row2 = new ActionRowBuilder().addComponents(selectMonth)
        const row3 = new ActionRowBuilder().addComponents(selectDay)

        if (string != '')
        {
            await interaction.reply({"content": string, components: [row, row2, row3], ephemeral: false});
        }
    }
}