# Discord Music Bot

## Table of Contents

* [About the Project](#about-the-project)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Host the bot](#host-the-bot)
* [Contact](#contact)

## About the project

Want to play rickroll when your friends join your discord channel? This is a simple discord bot that plays music when a specific user joins the channel. The project also contains the necessary files for hosting the bot with node.js to keep it online at all hours.\
![](botGif.gif)

## Getting started

### Prerequisites

* node.js
[https://nodejs.org/en/](https://nodejs.org/en/) Note: You need node.js version 10.0.0 or newer

### Create the bot

1. Create an account or log in on [https://discordapp.com/developers/applications/](https://discordapp.com/developers/applications/)
2. Create a new application on the website
3. Get your authorization token
    1. Go to "Bot" section in the setting to the left on the site
    2. Copy the token
4. Send bot to server
    1. Go to OAuth2
    2. Under OAuth2 URL Generator select bot and application.commands
    3. Under BOT PERMISSIONS select administrator
    4. Copy the link and paste it into your browser
    5. The bot should now show in your channel

 ### Installation
 
1. Clone the repository
2. Create a new file auth.js and add your auth
```sh
module.exports = {
    token <add discord token here>: ,
    parseAppId:,
    parseJsId:,
    botAppId: <right click on bot and copy id>,
    serverId: <right click on server and copy id>
}
```
3. run "npm install"

## Host the bot

I've personally hosted my discord bot on [https://www.heroku.com/](https://www.heroku.com/) which works good most of the time and is 100% free, however, it is not recommend by discord developers since it doesn't work too good with the opus engine\
The files required for the host already exists.
1. Create a project on heroku
2. Add buildpacks
    1. Go to settings -> buildpacks and add the following buildpacks
    2. heroku/nodejs
    3. https://github.com/dubsmash/heroku-buildpack-opus.git
    4. https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest
3. Push your code to the project
4. Under resources in your project make sure that "worker" is enabled
5. The bot should now work

## Contact

Tobias Mellberg - Tobbemellberg@hotmail.se
