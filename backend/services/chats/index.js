const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const chatRoutes = require('./src/routes/chatsRoutes');
const friendshipModel = require('../friendships/src/models/friendModel');
const chatModel = require('./src/models/chatsModel'); // Move require to top level
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

    socket.on('join_chat', ({ senderId, receiverId }) => {
        const roomId = [senderId, receiverId].sort().join('-');
        socket.join(roomId);
        console.log(`User ${senderId} joined room ${roomId}`);
    });

    socket.on('send_private_message', async ({ senderId, receiverId, message, temp_id }) => {
        try {
            const areFriends = await friendshipModel.checkFriendship(senderId, receiverId);
            if (areFriends) {
                const savedMessage = await chatModel.saveMessage(senderId, receiverId, message);
                const roomId = [senderId, receiverId].sort().join('-');
                
                // Broadcast to all clients in the room, including sender
                io.in(roomId).emit('receive_private_message', {
                    id: savedMessage.id,
                    senderId,
                    receiverId,
                    message,
                    created_at: savedMessage.createdAt,
                    temp_id
                });

                // Send confirmation back to sender
                socket.emit('message_sent_confirmation', {
                    temp_id,
                    id: savedMessage.id
                });
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