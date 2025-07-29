
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js')
const {convertToTime} = require('../../TimeHandling/TimeConverter.js')

function getMenuBuilders(year, month, day)
{
    const selectYear = new StringSelectMenuBuilder()
    .setCustomId('year')
    .setPlaceholder(year)
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
        new StringSelectMenuOptionBuilder()
            .setLabel('2030')
            .setValue('2030'),
    );

    const selectMonth = new StringSelectMenuBuilder()
        .setCustomId('month')
        .setPlaceholder(month)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('All')
                .setValue('All'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Januari')
                .setValue('Januari'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Februari')
                .setValue('Februari'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Mars')
                .setValue('Mars'),
            new StringSelectMenuOptionBuilder()
                .setLabel('April')
                .setValue('April'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Maj')
                .setValue('Maj'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Juni')
                .setValue('Juni'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Juli')
                .setValue('Juli'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Augusti')
                .setValue('Augusti'),
            new StringSelectMenuOptionBuilder()
                .setLabel('September')
                .setValue('September'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Oktober')
                .setValue('Oktober'),
            new StringSelectMenuOptionBuilder()
                .setLabel('November')
                .setValue('November'),
            new StringSelectMenuOptionBuilder()
                .setLabel('December')
                .setValue('December'),
        );

    const selectDay = new StringSelectMenuBuilder()
        .setCustomId('day')
        .setPlaceholder(day)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('All')
                .setValue('All'),
            new StringSelectMenuOptionBuilder()
                .setLabel('1-7')
                .setValue('1-7'),
            new StringSelectMenuOptionBuilder()
                .setLabel('8-15')
                .setValue('8-15'),
            new StringSelectMenuOptionBuilder()
                .setLabel('16-23')
                .setValue('16-23'),
            new StringSelectMenuOptionBuilder()
                .setLabel('24-31')
                .setValue('24-31'),
        );

        const row = new ActionRowBuilder().addComponents(selectYear);
        const row2 = new ActionRowBuilder().addComponents(selectMonth)
        const row3 = new ActionRowBuilder().addComponents(selectDay)

    return [row, row2, row3];
}

function getWeekNumber(date) 
{
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
    return weekNo.toString().padStart(2, '0');
}

function extractFilteredDates(user, yearSelection, monthSelection, weekSelection) {
  const allDates = [];
  const grouped = {};

  const allYears = yearSelection === 'All';
  const allMonths = monthSelection === 'All';
  const allWeeks = weekSelection === 'All';

    if (weekSelection != 'All')
    {
        daySelection = splitDay(weekSelection)
    }

    const monthToInt = {'All': 'All', 'Januari': '01', 'Februari': '02', 'Mars': '03', 'April': '04', 'Maj': '05', 'Juni': '06', 'Juli': '07', 'Augusti': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'December': '12'};

    monthSelection = monthToInt[monthSelection]

    const selectedYears = getUserObject(user.timeObject, [yearSelection])

    for (const [key, years] of Object.entries(selectedYears))
    {
        const selectedMonths = getUserObject(years, [monthSelection])

        for (const [key2, month] of Object.entries(selectedMonths))
        {
            const selectedDays = getUserObject(month, daySelection)

            for (const [key2, day] of Object.entries(selectedDays))
            {
                const m = month.padStart(2, '0');
                const d = day.padStart(2, '0');
                const date = new Date(`${years}-${m}-${d}`);

                const week = getWeekNumber(date);

                if (allMonths && allWeeks) 
                {
                    allDates.push(date); // global mode
                } else {
                // Build grouping key
                const key = allWeeks
                    ? `${years}-${m}`                  // month group
                    : `${years}-${m}-W${week}`;       // week group

                if (!grouped[key])
                    grouped[key] = [];
                    grouped[key].push(date);
                }
            }
        }
    }

    const now = new Date();
    const nowYear = now.getFullYear().toString();
    const nowMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const nowWeek = getWeekNumber(now);

    const yearMatch = allYears || year == nowYear;
    const monthMatch = allMonths || month == nowMonth;
    const weekMatch = allWeeks || week == nowWeek;

    if (yearMatch && monthMatch && weekMatch) {
        if (allMonths && allWeeks) {
        allDates.push(now);
        } else {
        const key = allWeeks ? `${nowYear}-${nowMonth}-W${nowWeek}` : `${nowYear}-${nowMonth}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(now);
        }
    }

    if (allMonths && allWeeks)
    {
        return { mode: 'global', dates: allDates.sort((a, b) => a - b) };
    } 
    else 
    {
        for (const key in grouped) 
        {
            grouped[key].sort((a, b) => a - b);
        }
        return { mode: 'grouped', dates: grouped };
    }
}

function findLongestGap(dates) {
  if (dates.length < 2) return -1;
  let maxGap = 0;
  for (let i = 1; i < dates.length; i++) {
    const gap = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    if (gap > maxGap) maxGap = gap;
  }
  return maxGap;
}

function getMaxGap(user, yearFilter = [], monthFilter = [], weekFilter = []) {
  const { mode, dates } = extractFilteredDates(user, yearFilter, monthFilter, weekFilter);

  if (mode === 'global') {
    return findLongestGap(dates);
  }

  let maxGap = 0;
  for (const key in dates) {
    const gap = findLongestGap(dates[key]);
    if (gap > maxGap) maxGap = gap;
  }
  return maxGap;
}

async function getLongestAway(user, year, month, day)
{
    console.log("Is in discord: " + Boolean(user.InDiscord))

    
    if (year === 'All' && month === 'All' && day === 'All')
    {
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
    else
    {
        return getMaxGap(user, year, month, day)
    }
}

function getUserObject(object, selectionString)
{
    if (selectionString == 'All')
        return object

    let retObject = new Object()

    for (const [key, val] of Object.entries(object))
    {
        if (selectionString.includes(key))
            retObject[key] = val
    }

    return retObject
}

function splitDay(daySelection)
{
    const tmpSplit = daySelection.split('-')
    let tmp = []
    for (let i = Number(tmpSplit[0]); i <= Number(tmpSplit[1]); i++)
    {
        let string = ''
        if (i < 10)
            string += '0'
        string += String(i)
        tmp.push(string)
    }
    return tmp
}

function getUserTime(user, yearSelection, monthSelection, daySelection)
{
    let time = 0

    if (yearSelection == 'All' && monthSelection == 'All' && daySelection == 'All')
        time += user.time

    if (daySelection != 'All')
    {
        daySelection = splitDay(daySelection)
    }

    const monthToInt = {'All': 'All', 'Januari': '01', 'Februari': '02', 'Mars': '03', 'April': '04', 'Maj': '05', 'Juni': '06', 'Juli': '07', 'Augusti': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'December': '12'};

    monthSelection = monthToInt[monthSelection]

    const selectedYears = getUserObject(user.timeObject, [yearSelection])

    for (const [key, years] of Object.entries(selectedYears))
    {
        const selectedMonths = getUserObject(years, [monthSelection])

        for (const [key2, month] of Object.entries(selectedMonths))
        {
            const selectedDays = getUserObject(month, daySelection)

            for (const [key2, day] of Object.entries(selectedDays))
            {
                time += Number(day)
            }
        }
    }

    return time
}

function getUserStreak(user, yearSelection, monthSelection, daySelection)
{
    let ret = 0
    let streak = 0

    if (daySelection != 'All')
    {
        daySelection = splitDay(daySelection)
    }

    const monthToInt = {'All': 'All', 'Januari': '01', 'Februari': '02', 'Mars': '03', 'April': '04', 'Maj': '05', 'Juni': '06', 'Juli': '07', 'Augusti': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'December': '12'};

    monthSelection = monthToInt[monthSelection]

    const selectedYears = getUserObject(user.timeObject, [yearSelection])

    const lastDate = new Date()

    for (const [currentYear, years] of Object.entries(selectedYears))
    {
        const selectedMonths = getUserObject(years, [monthSelection])

        for (const [currentMonth, month] of Object.entries(selectedMonths).sort(([a], [b]) => Number(a) - Number(b)))
        {
            const selectedDays = getUserObject(month, daySelection)

            for (const [currentDay, day] of Object.entries(selectedDays))
            {
                const newDate = new Date(currentYear, parseInt(currentMonth)-1, currentDay)
                const nextDate = new Date(lastDate)
                nextDate.setDate(nextDate.getDate() + 1)

                if (nextDate.getDate() === newDate.getDate() &&
                    nextDate.getMonth() === newDate.getMonth() &&
                    nextDate.getFullYear() === newDate.getFullYear())
                {
                    streak++
                }
                else
                {
                    streak = 1
                }
                ret = Math.max(ret, streak)
                lastDate.setDate(newDate.getDate());
                lastDate.setMonth(newDate.getMonth());
                lastDate.setFullYear(newDate.getFullYear());
            }
        }
    }

    return String(ret)
}

function getSessionTime(user, yearSelection, monthSelection, daySelection)
{
    if (yearSelection == 'All' && monthSelection == 'All' && daySelection == 'All')
        return user.sessionTime

        if (daySelection != 'All')
    {
        daySelection = splitDay(daySelection)
    }

    const monthToInt = {'All': 'All', 'Januari': '01', 'Februari': '02', 'Mars': '03', 'April': '04', 'Maj': '05', 'Juni': '06', 'Juli': '07', 'Augusti': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'December': '12'};

    let sessionTime = 0

    monthSelection = monthToInt[monthSelection]

    const selectedYears = getUserObject(user.timeObject, [yearSelection])

    const lastDate = new Date()

    for (const [currentYear, years] of Object.entries(selectedYears))
    {
        const selectedMonths = getUserObject(years, [monthSelection])

        for (const [currentMonth, month] of Object.entries(selectedMonths).sort(([a], [b]) => Number(a) - Number(b)))
        {
            const selectedDays = getUserObject(month, daySelection)

            for (const [currentDay, day] of Object.entries(selectedDays))
            {
                sessionTime = Math.max(sessionTime, day)
            }
        }
    }

    return sessionTime
}

async function getUserTimesScoreboard(personsInDiscord, year, month, day)
{
    var out = new Array()
                  
    for (const person in personsInDiscord)
    {
        let time = getUserTime(personsInDiscord[person], year, month, day)
        let streak = getUserStreak(personsInDiscord[person], year, month, day)
        let longestAway = await getLongestAway(personsInDiscord[person], year, month, day)
        let sessionTime = getSessionTime(user, year, month, day)
        out.push( {"name": personsInDiscord[person].userName, "InDiscord": personsInDiscord[person].InDiscord, "time": time, "sessionTime": sessionTime, "leftTime": personsInDiscord[person].leftTime, "longestAway": longestAway, "streak": streak} )
    }
    
    out.sort(function(a, b){return Number(b.time) - Number(a.time) });
    
    var string = " P | Name                | Time        | sessionTime | Longest Away | Streak \n"
    string    += '-----------------------------------------------------------------------------\n'
    
    for (let i = 0; i < out.length; i++)
    {
      string += String(i+1).padEnd(2) + " | "
      
      let tmpName = out[i].name.padEnd(20, " ")
      string += tmpName + "  "
      
      let tmpTime = convertToTime(out[i].time).padEnd(12, " ")
      string += tmpTime + "  "
      
      let tmpSessionTime = convertToTime(out[i].sessionTime) .padEnd(12, " ")
      string += tmpSessionTime + "  "
      
      let tmpLongestAwayStr = await getLongestAway(out[i])
      tmpLongestAwayStr = Number(tmpLongestAwayStr)
      let tmpLongestAway = tmpLongestAwayStr !== 0 ? convertToTime(tmpLongestAwayStr).padEnd(13, " ") : String("No Data").padEnd(13, " ")
      string += tmpLongestAway + "  "

      let tmpStreak = out[i].streak.padEnd(6, " ")
      string += tmpStreak + "\n"
    }

    const discordMessage = "```" + string + "```"

    return discordMessage
}

module.exports = {
    data :
    new SlashCommandBuilder()
    .setName('onionscore')
    .setDescription('Lists all the onion'),

    async execute(interaction, context) 
    {
        var {timeHandler} = context;

        var personsInDiscord = timeHandler.getDiscordTimes()
    
        var string = await getUserTimesScoreboard(personsInDiscord, 'All', 'All', 'All')

        var menuBuilders = getMenuBuilders('All', 'All', 'All')

        if (string != '')
        {
            await interaction.reply({"content": string, components: menuBuilders, ephemeral: false});
        }
    },

    async update(interaction, context)
    {
        const originalUserId = interaction.message.interaction?.user.id;

        if (interaction.user.id !== originalUserId) {
            return await interaction.reply({
                content: "❌ You cannot update this menu. Only the original user can interact!",
                ephemeral: true
            });
        }

        var {timeHandler} = context;

        var personsInDiscord = timeHandler.getDiscordTimes()

        const yearData = interaction.message.components[0]['components'][0]['data']
        const monthData = interaction.message.components[1]['components'][0]['data']
        const dayData = interaction.message.components[2]['components'][0]['data']

        let year = yearData['placeholder']
        let month = monthData['placeholder']
        let day = dayData['placeholder']

        if (interaction.customId == yearData['custom_id'])
            year = interaction.values[0]
        if (interaction.customId == monthData['custom_id'])
            month = interaction.values[0]
        if (interaction.customId == dayData['custom_id'])
            day = interaction.values[0]

        const menuBuilders = getMenuBuilders(year, month, day)

        var contentString = await getUserTimesScoreboard(personsInDiscord, year, month, day)

        await interaction.update({"content": contentString, components: menuBuilders, ephemeral: false})
    }
}