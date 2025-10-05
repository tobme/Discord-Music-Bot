
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

async function getUserTimesScoreboard(timeCalculator, year, month, day)
{
    var out = timeCalculator.getTimeData(year, month, day)
    
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
      
      let tmpLongestAwayStr = out[i].longestAway
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
        var {timeCalculator} = context;
    
        var string = await getUserTimesScoreboard(timeCalculator, 'All', 'All', 'All')

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

        var {timeCalculator} = context;

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

        var contentString = await getUserTimesScoreboard(timeCalculator, year, month, day)

        await interaction.update({"content": contentString, components: menuBuilders, ephemeral: false})
    }
}