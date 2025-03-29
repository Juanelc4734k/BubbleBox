//importacion de librerias
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const cors = require('cors');
const httpProxy = require('http-proxy');

const PORT = process.env.PUERTO || 3000;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  

  // Crear un worker por cada núcleo de CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Si un worker muere, lo reiniciamos
  cluster.on("exit", (worker, code, signal) => {
    
    cluster.fork();
  });
} else {
  // Crear una instancia de Express
  const app = express();

  // Configurar CORS
  app.use(cors());

  // Crear un proxy
  const proxy = httpProxy.createProxyServer();

  // Configurar los servicios disponibles
  const servicios = {
    chats: 'http://localhost:3001',
    reels: 'http://localhost:3002',
    stories: 'http://localhost:3003',
    communities: 'http://localhost:3004',
    friendships: 'http://localhost:3005',
    notifications: 'http://localhost:3007',
    posts: 'http://localhost:3008',
    users: 'http://localhost:3009',
    auth: 'http://localhost:3010',
    comments: 'http://localhost:3011',
    reactions: 'http://localhost:3012',
    stats: 'http://localhost:3013',
    backups: 'http://localhost:3014',
    reports: 'http://localhost:3015'
  };

  // Middleware para manejar el enrutamiento de solicitudes a microservicios
  app.use((req, res) => {
    const servicio = req.url.split('/')[1];
    if (servicios[servicio]) {
      
      proxy.web(req, res, {
        target: servicios[servicio],
        ignorePath: false
      });
    } else {
      
      res.status(404).send('Servicio no encontrado');
    }
  });

  // Middleware para manejar errores del proxy
  proxy.on('error', (err, req, res) => {
    console.error('Error de proxy:', err);
    res.status(500).send('Error interno del servidor');
  });

  // Iniciar el servidor
  app.listen(PORT, () => {
    
  });
}