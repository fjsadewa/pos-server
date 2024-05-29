const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', async (req, res) => {
      res.sendFile(join(__dirname, 'index.html'));
  });

app.get('/display', async (req, res) => {
      res.sendFile(join(__dirname, 'display.html'));
  });

app.use(express.static(__dirname + '/public'));

app.get('/call', (req, res) => {
  res.header('Access-Control-Allow-Origin','*');
  io.emit('call', req.query.sequence);
  res.send('calling');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});



// const parseRequest = require('parse-request');
