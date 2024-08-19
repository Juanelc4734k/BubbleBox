const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const chatRoutes = require('./src/routes/chatsRoutes');
const friendshipModel = require('../friendships/src/models/friendModel');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

//middlewares
app.use(cors());
app.use(express.json());

//routes
app.use('/chats', chatRoutes);

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('send_message', async ({ senderId, receiverId, message }) => {
        try {
            const areFriends = await friendshipModel.checkFriendship(senderId, receiverId);
            if (areFriends) {
                const savedMessage = await require('./src/models/chatModel').saveMessage(senderId, receiverId, message);
                io.emit('receive_message', savedMessage);
            } else {
                socket.emit('error', 'No puedes enviar mensajes a usuarios que no son tus amigos');
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            socket.emit('error', 'Error al enviar el mensaje');
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


const PORT =  process.env.CHATS_PORT || 3001;
server.listen(PORT, () => console.log(`Service Chats running on port ${PORT}`));