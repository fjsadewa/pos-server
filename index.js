const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs');
const { ThermalPrinter }  = require('node-thermal-printer');

const printer = new ThermalPrinter({
  width: 80,
});

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', async (req, res) => {
      res.sendFile(join(__dirname, 'index.html'));
});

// async function getQueueData() {
//   const response = await fetch('http://localhost/laravel-10/antrianpos-app/public/getAntrian');
//   const data = await response.json();
// }

app.get('/print', async (req, res) => {
  res.sendFile(join(__dirname, 'print.html'));
});

app.get('/display', async (req, res) => {
  res.sendFile(join(__dirname, 'display.html'));
});

app.get('/show', (req, res) => {
  res.header('Access-Control-Allow-Origin','*');
  io.emit('show', req.query.list);
  res.send('showing');
});

app.use(express.static(__dirname + '/public'));

app.get('/call', (req, res) => {
  res.header('Access-Control-Allow-Origin','*');
  io.emit('call', req.query.sequence);
  res.send('calling');
});

const templateHTML = fs.readFileSync('print.html', 'utf8');
printer.print(templateHTML);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('server running at http://192.168.5.160:3000');
});
// term & conditions di notifikasi
// searching destination
// searching package
// searching whislist *perlu atau tidak
// see all offer ini kemana
// search page
// header detail destination
// milih tanggal di booking page
// dropdown di package 
