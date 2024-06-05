const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs');
const { ThermalPrinter }  = require('node-thermal-printer');
//const baseUrl = "http://localhost/laravel-10/antrianpos-app/public";

//const printer = new ThermalPrinter({
//  width: 80,
//  interface: "usb", // Ganti dengan interface yang sesuai (usb, serial, dll)
//  port: "/dev/usb0", // Ganti dengan port yang sesuai
//  model: "BP-T80P", // Model printer Blueprint BP-T80P
//});


 const printer = new ThermalPrinter({
   width: 80,
 });

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', async (req, res) => {
      res.sendFile(join(__dirname, 'index.html'));
});

async function getQueueData() {
  const response = await fetch('http://localhost/laravel-10/antrianpos-app/public/getAntrian');
  const data = await response.json();
}

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

//app.get("/print-queue", async (req, res) => {
//  try {
//    await printer.connect();
//
//    const response = await fetch(`${baseUrl}/getAntrian`);
//    const queueData = await response.json();
//
//    if (queueData) {
//      printer.align("center");
//      printer.print("Pos Indonesia");
//      printer.feed(2);
//
//      printer.align("left");
//      printer.print(`Nomor Antrian: ${queueData.nomor_urut}`);
//      printer.print(`Kode Pelayanan: ${queueData.kode_pelayanan}`);
//      printer.print(`Nama Pelayanan: ${queueData.nama_pelayanan}`);
//      printer.print(`Waktu Diambil: ${queueData.timestamp}`);
//      printer.feed(2);
//
//      printer.cut();
//      await printer.disconnect();
//    } else {
//      await printer.disconnect();
//    }
//
//    res.status(200).json({ message: "Data antrian telah dicetak" });
//  } catch (error) {
//    console.error("Error:", error);
//    res.status(500).json({ error: error.message });
//  }
//});

const templateHTML = fs.readFileSync('print.html', 'utf8');
printer.print(templateHTML);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
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
