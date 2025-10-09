# Use the latest Node.js LTS or current version
FROM node:22

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy your app source code
COPY . .

# Expose a port if needed (for example, if your bot has a web dashboard)
EXPOSE 3000

# Start the bot
CMD ["node", "app.js"]
