//var { engines } = import('./package');
const Parser = require("parse/node.js");
const TimeHandler = require('./DiscordTimeHandler.js')
const SoundHandler = require('./SoundHandler.js')
const auth = require("./auth.js")

const fs = require('fs');
const path = require('node:path')

Parser.initialize(auth.parseAppId, auth.parseJsId);
Parser.serverURL = 'https://parseapi.back4app.com/'

console.log("Starting")

//const { join } = require("path");

const { Client, GatewayIntentBits, Events, Collection, REST, Routes } = require('discord.js')

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildPresences] });

const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType, entersState   } = require("@discordjs/voice")
 
const player = createAudioPlayer();

var connection

var token = auth.token
var botAppId = auth.botAppId
var serverID = auth.serverId

bot.login(token);

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

SoundHandler.retrieveSounds(Parser)
TimeHandler.retrieveDiscordTimes(Parser)

/*
Parse.Cloud.afterSave("Sounds", (request) => 
{
	let file = request.object.get('File')
	
	let name = file["_name"].toString()
	let approved = Boolean(request.object.get('approved'))
	let queueable = Boolean(request.object.get('queueable'))
	let creatorName = request.object.get('creator')
	let objectId = request.object.get('objectId')
	name = name.substring(name.indexOf("_") + 1)
	name = name.substring(0, name.indexOf("."))
	
	if (!approved)
	{
		SoundHandler.removeSong(name)
	}
	else
	{
		SoundHandler.addSong(name, file["_url"], queueable, objectId, creatorName)
	}
});

Parse.Cloud.job("noIdle", async (request) => {
  console.log("Keep idle")
});
*/

bot.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

function playFile(fileURL)
{
	const resource = createAudioResource(fileURL, { inlineVolume: true });
	player.play(resource);


	return entersState(player, AudioPlayerStatus.Playing, 5e3);
}

function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.channelId,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});

	try {
		entersState(connection, VoiceConnectionStatus.Ready, 30e3);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

var playing = false

player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
    playing = false
});

player.on(AudioPlayerStatus.Playing, () => {
    playing = true
});

bot.on("presenceUpdate", (oldMember, newMember) => {

	if (!TimeHandler.isUserInDiscord(newMember.user.id) ||
		oldMember.status == newMember.status)
	{
		return
	}

	if (newMember.status == "idle") // going afk
	{
		console.log("User going afk ", newMember.user.id)
		TimeHandler.userAfk(newMember.user.id, Parser)
	}
	else if (oldMember.status == "idle") // coming back from afk
	{
		console.log("User coming back ", newMember.user.id)
		TimeHandler.backFromAfk(newMember.user.id, Parser)
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
		
		TimeHandler.userJoined(userID, userName, Parser)

    	var file = ''

		if (!playing)
		{
			file = SoundHandler.getNextSong(Parser)
			
			console.log("Play file: " + file)

			if (file !== '')
			{
				try
				{
					playFile(file)
					connection = connectToChannel(newState)
					connection.subscribe(player);
				}
				catch(error)
				{
					console.log("Failed to play sound: " + error.message)
					return
				}
			}
		}

	}
	else if (oldUserChannel !== null && newUserChannel === null)
	{
		TimeHandler.userLeft(userID, Parser)
	}
});
