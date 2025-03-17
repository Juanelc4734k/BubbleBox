//importacion de librerias
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const cors = require('cors');
const httpProxy = require('http-proxy');

const PORT = process.env.PUERTO || 3000;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Iniciando ${numCPUs} workers...`);

<<<<<<< HEAD
  // Crear un worker por cada núcleo de CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
=======
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


app.get('/users/health', (req, res) => {
  console.log('Healthcheck solicitado para el servicio "users"');
  proxy.web(req, res, { target: `${servicios.users}/health`, ignorePath: true });
});

// Middleware para manejar el enrutamiento de solicitudes a microservicios
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
>>>>>>> 7deed9e85adcc4aca1b326d899507674d1830019
  }

  // Si un worker muere, lo reiniciamos
  cluster.on("exit", (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} murió. Creando uno nuevo...`);
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

  // Middleware para manejar errores del proxy
  proxy.on('error', (err, req, res) => {
    console.error('Error de proxy:', err);
    res.status(500).send('Error interno del servidor');
  });

  // Iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} escuchando en el puerto ${PORT}`);
  });
}