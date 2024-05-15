const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

// const parseRequest = require('parse-request');

const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost/laravel-10/antrianpos-app/public/form'); 
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error(error);
    return []; 
  }
};


app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
  const categories = await fetchCategories();
  
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/call', (req, res) => {

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