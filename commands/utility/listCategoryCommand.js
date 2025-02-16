
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js')

function getContentMenu(musicList, defaultValue)
{
    const categoryMenu = new StringSelectMenuBuilder()
                            .setCustomId('category')

    if (defaultValue != undefined)
    {
        categoryMenu.setPlaceholder(defaultValue)
    }

    let listedCategories = []
    for (music of musicList)
    {
        if (music.category != undefined && !listedCategories.includes(music.category) && music.queueable)
        {
            categoryMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(music["category"])
                    .setValue(music["category"]))

            listedCategories.push(music.category)
        }
    }

    const row = new ActionRowBuilder().addComponents(categoryMenu);

    return [row]
}

module.exports = {
  data :
    new SlashCommandBuilder()
    .setName('listbycategory')
    .setDescription('Lists all sounds by one category'),

  async execute(interaction, context)
   {
      const {playBackManger} = context;
      var musicList = playBackManger.getMusicList()

      const contentMenu = getContentMenu(musicList)

      await interaction.reply({content: "Choose category", components: contentMenu, ephemeral: true});
    },

    async update(interaction, context)
    {
        const {playBackManger} = context;
        var musicList = playBackManger.getMusicList()

        console.log(interaction.values[0])
  
        const contentMenu = getContentMenu(musicList, interaction.values[0])

        try
        {
          let string = ''
          for (music of musicList)
          {
            if (music.hasOwnProperty("queueable") && music.hasOwnProperty("name") && music.hasOwnProperty("category"))
            {
                if (Boolean(music["queueable"]) && music["category"] == interaction.values[0])
                {
                    string += music["name"] + ", "
                }
            }
          }
          await interaction.update({content: string, components: contentMenu, ephemeral: true});
        }
        catch(error)
        {
          console.log("error with list command")
        }
    }
}