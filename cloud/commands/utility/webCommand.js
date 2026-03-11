
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data:
        new SlashCommandBuilder()
        .setName('web')
        .setDescription('Visar länk till webbsidan'),

    async execute(interaction, context)
    {
        await interaction.reply({ content: 'https://mrbot.b4a.app/', ephemeral: true });
    }
}
