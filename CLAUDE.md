## Current Goal
Assist in general development, including feature expansion, debugging, and maintaining code quality across the music and user-data modules.

## Tech Stack
- **Engine:** Node.js (v22+)
- **Library:** discord.js

# Discord Bot Project Context
- **Core Logic:** Located in `/cloud`. I use `discord.js`.
- **Testing:** Located in `/unittest`. I use [Jest].
- **Frontend:** Located in `/public`.
- **Style:** Use ES Modules (import/export). Always include error handling for Discord API calls.

## Common Commands
- **Run tests:** `npm test`
- **Run the bot (Dev):** `node cloud/app.js`
- **Install dependencies:** `npm install`

## Development Rules
1. **Security First:** Never hardcode tokens or database URIs. Use `process.env`.
2. **Music Logic:** Always ensure audio resources are properly cleaned up on disconnect.
3. **User Data:** Validate all incoming data before saving to the database.
4. **Testing:** Before finalizing a feature, check if a test in `/unittest` is needed.