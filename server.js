// server.js
const http = require('http');
require('./app.js');

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!');
  })
  .listen(3000, () => {
    console.log('Server is ready.');
  });