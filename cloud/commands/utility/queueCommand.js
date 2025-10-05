
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data :
    new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Rank top 10 spammed sounds')
    .addStringOption(option =>
        option.setName('name')
            .setDescription("Song name")
            .setRequired(true)),

    async execute(interaction, context) 
    {
        const {playBackManger} = context;

        let songName = interaction.options.get('name').value

        console.log("Trying to add %s...", songName)

        var success = playBackManger.addQueue(songName)

        if (success)
        {
            await interaction.reply({content: "Song added", ephemeral: true});
        }
        else
        {
            await interaction.reply({content: "Song not found", ephemeral: true});
        }
    }
}