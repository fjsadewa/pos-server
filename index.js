require('dotenv').config();
const mysql = require('mysql');

const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fs = require('fs');
const { ThermalPrinter }  = require('node-thermal-printer');

const readEnvFile = () => {
  if (fs.existsSync('.env')) {
    const envData = fs.readFileSync('.env', 'utf8');
    return envData.split('\n').reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value !== undefined) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
  }
  return {};
};

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'antrianpos'
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
});

const printer = new ThermalPrinter({
  width: 80,
});

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', async (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/env', (req, res) => {
  res.json({ NOMOR_IP: process.env.NOMOR_IP });
});

app.get('/print', async (req, res) => {
  res.sendFile(join(__dirname, 'print.html'));
});

app.get('/display', async (req, res) => {
  res.sendFile(join(__dirname, 'display.html'));
});

app.post('/notify', (req, res) => {
  io.emit('updateQueue');
  res.sendStatus(200);
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

const writeEnvFile = (data) => {
  const envData = Object.keys(data).map(key => `${key}=${data[key]}`).join('\n');
  fs.writeFileSync('.env', envData, 'utf8');
};

const saveIpServerToEnv = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM ip_servers LIMIT 1', (err, results) => {
      if (err) {
        reject('Database query failed: ' + err.message);
        return;
      }
      if (results.length === 0) {
        reject('No data found in ip_servers table');
        return;
      }

      const ipData = results[0];
      const envData = readEnvFile();

      if (envData.NOMOR_IP !== ipData.nomor_ip) {
        envData.NOMOR_IP = ipData.nomor_ip;

        writeEnvFile(envData);
        resolve('Data saved to .env');
      } else {
        resolve('No changes in data');
      }
    });
  });
};

saveIpServerToEnv()
  .then(message => console.log(message))
  .catch(error => console.error(error));

const templateHTML = fs.readFileSync('print.html', 'utf8');
printer.print(templateHTML);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('server running');
});