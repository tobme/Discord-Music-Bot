
const { SlashCommandBuilder } = require('discord.js')
const SoundHandler = require('../../SoundHandler.js');

module.exports = {
  data :
    new SlashCommandBuilder()
    .setName('list')
    .setDescription('Lists all sounds'),

  async execute(interaction) {

      var musicList = SoundHandler.musicList

      await interaction.reply({content: "Sending sounds", ephemeral: true});
      
      try
      {
        let stringIndex = 0
        let stringArray = new Array()
        for (let j = 0; j < musicList.length; j = j + 150)
        {
            let string = ''
            for (let i = j; i < Math.min(musicList.length, j+150); i++)
            {
              if (musicList[i].hasOwnProperty("queueable") && musicList[i].hasOwnProperty("name"))
              {
                if (Boolean(musicList[i]["queueable"]))
                {
                    string += musicList[i]["name"] + ", "
                }
              }
            }
              stringArray[stringIndex] = string
              stringIndex = stringIndex + 1

              await interaction.followUp({content: string, ephemeral: true});
        }
      }
      catch(error)
      {
        console.log("error with list command")
      }
    }
}