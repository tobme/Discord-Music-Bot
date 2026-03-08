# Discan — Discord Bot

A Discord bot for tracking voice channel activity and playing sounds, with a web-based leaderboard.

## Features

- **Sound playback** — Plays a sound when a user joins a voice channel. Sounds are stored in a Parse (Back4App) database.
- **Time tracking** — Tracks how long each user spends in Discord voice channels per day, with AFK detection. Separates active time (`timeObject`) from farming time (`farmingObject`).
- **Onion Score** — Leaderboard accessible via the `/onionscore` slash command or the web frontend, filterable by year, month, and period.
- **User profiles** — Web frontend shows per-user stats: best day, streaks, farming ratio, best weekday, uploaded sounds, and more.
- **Message reactions** — Bot automatically reacts to all server messages with emoji.
- **Daily reload** — Sound library reloads from the database every 24 hours.

## Slash Commands

| Command | Description |
|---|---|
| `/onionscore` | Shows the Discord time leaderboard with interactive year/month/period filters |
| `/list` | Lists all queueable sounds |
| `/listcategory` | Lists sounds grouped by category |
| `/queue` | Queues a sound for playback |
| `/spam` | Spam a sound |

## Web Frontend (`/public`)

| Page | Description |
|---|---|
| `index.html` | Main landing page |
| `onion.html` | Onion Score leaderboard with charts and personal profile pages |
| `upload.html` | Upload new sounds to the database |
| `budord.html` | Server rules |

## Project Structure

```
cloud/                  # Bot logic (Node.js)
  app.js                # Entry point
  ChannelManager.js     # Voice channel & sound playback coordination
  MusicHandling/        # Sound loading, queuing, playback, shuffle
  TimeHandling/         # Time tracking, calculations, user management
  commands/utility/     # Slash command implementations
public/                 # Web frontend (HTML/CSS/JS)
unittest/               # Jest unit tests
```

## Getting Started

### Prerequisites

- Node.js v22+
- A Discord application and bot token — [Discord Developer Portal](https://discord.com/developers/applications)
- A [Back4App](https://www.back4app.com/) Parse application

### Create the bot

1. Create an application at [discord.com/developers/applications](https://discord.com/developers/applications)
2. Go to **Bot** → copy the token
3. Go to **OAuth2 → URL Generator**, select `bot` and `application.commands`, grant Administrator permission
4. Paste the generated URL in your browser and add the bot to your server

### Installation

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root with your credentials:
   ```env
   TOKEN=<discord bot token>
   PARSE_APP_ID=<back4app application id>
   PARSE_JS_ID=<back4app javascript key>
   BOT_APP_ID=<discord bot application id>
   SERVER_ID=<discord server id>
   ```
4. Start the bot:
   ```sh
   node cloud/app.js
   ```

### Running tests

```sh
cd cloud && npm test
```

## Contact

Tobias Mellberg — Tobbemellberg@hotmail.se
