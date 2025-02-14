
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data :
        new SlashCommandBuilder()
        .setName('spamsounds')
        .setDescription('Rank top 10 spammed sounds'),

    async execute(interaction, context) 
    {
        const {playBackManger} = context
        var musicList = playBackManger.getMusicList()

        let string = ''
        var tmpArray = new Array()

        for (let i = 0; i < musicList.length; i++)
        {
            if (Boolean(musicList[i].queueable))
            {
                tmpArray.push(musicList[i])
            }
        }

        tmpArray.sort(function(a, b){return Number(b.amountPlayed) - Number(a.amountPlayed) });

        for (let i = 0; i < Math.min(10, tmpArray.length); i++)
        {
            string += (i+1) + ": " + tmpArray[i].name + " - " + tmpArray[i].amountPlayed.toString() + '\n'
        }

        if (string != '')
        {
            await interaction.reply({"content": string, ephemeral: false});
        }
    }
}