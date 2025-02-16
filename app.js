//var { engines } = import('./package');
const Parser = require("parse/node.js");
const {createDiscordTimeHandler} = require('./TimeHandling/DiscordTimeHandlerFactory.js')
const TimeHandler = require('./TimeHandling/DiscordTimeHandler.js')
const {createPlayBackManager} = require('./MusicHandling/PlayBackManagerFactory.js')
const ChannelManager = require('./ChannelManager.js')
const auth = require("./auth.js")

const fs = require('fs');
const path = require('node:path')

Parser.initialize(auth.parseAppId, auth.parseJsId);
Parser.serverURL = 'https://parseapi.back4app.com/'

console.log("Starting")

const { Client, GatewayIntentBits, Events, Collection, REST, Routes } = require('discord.js')
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildPresences] });

var token = auth.token
var botAppId = auth.botAppId
var serverID = auth.serverId

bot.login(token);

const timeHandler = createDiscordTimeHandler(Parser)
const playBackManger = createPlayBackManager(Parser)
const channelManager = new ChannelManager(playBackManger)

const context = {
	playBackManger,
	timeHandler
}

console.log("Version: " + process.version);





const commands = [];
bot.commands = new Collection();
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
			bot.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(botAppId, serverID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

bot.on(Events.InteractionCreate, async interaction => {

	const command = interaction.client.commands.get(interaction.commandName);

	if (command) 
	{
		try 
		{
			await command.execute(interaction, context);
		} 
		catch (error)
		{
			console.error(error);
			if (interaction.replied || interaction.deferred) 
			{
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} 
			else 
			{
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}

		return
	}

	const originalMessage = interaction.message; // Fetch the message
	const storedCommand = originalMessage.interaction?.commandName; // Get command name from original interaction

	const command2 = interaction.client.commands.get(storedCommand);

	if (command2)
	{
		if (interaction.isStringSelectMenu()) 
			{
				if (command2)
				{
					await command2.update(interaction, context)
				}
				else 
				{
					console.error(error);
					if (interaction.replied || interaction.deferred) 
					{
						await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
					} 
					else 
					{
						await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
					}
				}
			}
	}


});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/*
Parse.Cloud.afterSave("Sounds", (request) => 
{
	let file = request.object.get('File')
	
	let name = file["_name"].toString()
	let approved = Boolean(request.object.get('approved'))
	let queueable = Boolean(request.object.get('queueable'))
	let creatorName = request.object.get('creator')
	let objectId = request.object.get('objectId')
	let category = request.object.get('category')
	name = name.substring(name.indexOf("_") + 1)
	name = name.substring(0, name.indexOf("."))
	
	if (!approved)
	{
		playBackManger.removeSong(name)
	}
	else
	{
		playBackManger.addSong(name, file["_url"], queueable, objectId, creatorName, category)
	}
});

Parse.Cloud.job("noIdle", async (request) => {
  console.log("Keep idle")
});
*/

bot.on("presenceUpdate", (oldMember, newMember) => {

	if (!timeHandler.isUserInDiscord(newMember.user.id) ||
		oldMember.status == newMember.status)
	{
		return
	}

	if (newMember.status == "idle") // going afk
	{
		console.log("User going afk ", newMember.user.id)
		timeHandler.userAfk(newMember.user.id)
	}
	else if (oldMember.status == "idle") // coming back from afk
	{
		console.log("User coming back ", newMember.user.id)
		timeHandler.backFromAfk(newMember.user.id)
	}
})

bot.on('messageCreate', async message => {

	if (!message.guild) return;
	
	if (message.author.id === botAppId) return;
	
	console.log(message.author.id + " " + message.content)
	try
	{
		message.react('😂');
		message.react('🤣');
		message.react('😃');
		message.react('😄');
		message.react('😆');
		message.react('😁');
		message.react('😣');
		message.react('😅');
		message.react('🙈');
		message.react('🙉');
		message.react('🙊');
	}
	catch(error)
	{
		console.error('Message deleted');
	}
});


bot.on('voiceStateUpdate', (oldState, newState) => {

	let newUserChannel = newState.channel
	let oldUserChannel = oldState.channel
	const streamOptions = {seek: 0, volume: 1 };
	
	var userID = newState.id
	
	if (userID === botAppId) // Bot has joined
	{
		return
	}
	
	if (oldUserChannel === null && newUserChannel !== undefined)
	{
		console.log("User has joined " + newState.id)
		
		const userName = newState.member.displayName
		
		timeHandler.userJoined(userID, userName)
		channelManager.playFile(newState)
	}
	else if (oldUserChannel !== null && newUserChannel === null)
	{
		timeHandler.userLeft(userID)
	}
});
	