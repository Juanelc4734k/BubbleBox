const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const createNotificationsRoutes = require('./src/routes/notificationsRoutes');

const app = express();
const server = http.createServer(app);
let io;

app.use(cors());
app.use(express.json());

const PORT = process.env.NOTIFICATION_PORT || 3007;

server.listen(PORT, () => {
    console.log(`Service Notifications running on port ${PORT}`);
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {

        socket.on('join', (userId) => {
            socket.join(userId);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    // Crear y usar las rutas después de inicializar io
    const notificationsRoutes = createNotificationsRoutes(io);
    app.use('/notifications', notificationsRoutes);
});

module.exports = { app };