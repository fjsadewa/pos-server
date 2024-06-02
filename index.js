const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const ThermalPrinter = require('node-thermal-printer');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', async (req, res) => {
      res.sendFile(join(__dirname, 'index.html'));
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

app.post('/print', async (req, res) => {
  const data = req.body.data; // Dapatkan data cetak dari request body
  const printer = new ThermalPrinter({
    width: 80,
    characterSet: 'A'
  });

  try {
    await printer.print(data); // Cetak data ke printer
    res.status(200).send('Data dicetak dengan sukses!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal mencetak data!');
  } finally {
    await printer.close(); // Tutup koneksi dengan printer
  }
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
