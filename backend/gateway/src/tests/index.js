const express = require('express');
const cors = require('cors');
const httpProxy = require('http-proxy');

const app = express();

app.use(cors());
const proxy = httpProxy.createProxyServer();

const servicios = {
  chats: 'http://localhost:3001',
  reels: 'http://localhost:3002',
  stories: 'http://localhost:3003',
  communities: 'http://localhost:3004',
  friendships: 'http://localhost:3005',
  posts: 'http://localhost:3008',
  users: 'http://localhost:3009',
  auth: 'http://localhost:3010',
  comments: 'http://localhost:3011',
  reactions: 'http://localhost:3012',
};

app.use((req, res) => {
  const servicio = req.url.split('/')[1];
  if (servicios[servicio]) {
    console.log(`Redirigiendo a ${servicios[servicio]}${req.url}`);
    proxy.web(req, res, { 
      target: servicios[servicio],
      ignorePath: false
    });
  } else {
    console.log(`Servicio no encontrado para la ruta: ${req.url}`);
    res.status(404).send('Servicio no encontrado');
  }
});

proxy.on('error', (err, req, res) => {
  console.error('Error de proxy:', err);
  res.status(500).send('Error interno del servidor');
});

const PUERTO = process.env.PUERTO || 3000;

app.listen(PUERTO, () => {
  console.log(`API Gateway escuchando en el puerto ${PUERTO}`);
  console.log('Servicios disponibles:', Object.keys(servicios).join(', '));
});