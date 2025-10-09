# Use the latest Node.js LTS or current version
FROM node:22

# Set working directory
WORKDIR /usr/src/app

# Copy only your cloud folder contents
COPY cloud/package*.json ./

RUN npm install

COPY cloud/. ./

# Expose a port if needed (for example, if your bot has a web dashboard)
ENV PORT=3000
EXPOSE 3000

# Start the bot
CMD ["node", "app.js"]
