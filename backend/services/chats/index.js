const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('./src/config/db');
const chatRoutes = require('./src/routes/chatsRoutes');
const friendshipModel = require('../friendships/src/models/friendModel');
const chatModel = require('./src/models/chatsModel'); // Move require to top level
const groupChatModel = require('./src/models/groupChatModel');
const http = require('http');
const socketIO = require('socket.io');

const onlineUsers = new Map();
const typingUsers = new Map();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
                const savedMessage = await chatModel.saveMessageWithNotification(senderId, receiverId, message);
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

    socket.on('user_online', async ({ userId }) => {
        try {
            // Store in memory map
            onlineUsers.set(parseInt(userId), {
                socketId: socket.id,
                lastSeen: new Date()
            });
            
            // Update last seen in database - explicitly set to 'conectado'
            await chatModel.updateLastSeen(parseInt(userId), 'conectado');
            
            // Broadcast to all users that this user is online - explicitly set isOnline to true
            io.emit('user_online_status', {
                userId: parseInt(userId),
                isOnline: true
            });
        } catch (error) {
            console.error('Error updating online status:', error);
        }
    });

    socket.on('broadcast_status', async ({ userId, isOnline }) => {
        try {
            console.log(`Broadcasting status for user ${userId}: ${isOnline ? 'online' : 'offline'}`);
            
            // Update in memory
            if (isOnline) {
                onlineUsers.set(parseInt(userId), {
                    socketId: socket.id,
                    lastSeen: new Date()
                });
                
                // Update database
                await chatModel.updateLastSeen(parseInt(userId), 'conectado');
            }
            
            // Broadcast to all connected clients
            io.emit('user_online_status', {
                userId: parseInt(userId),
                isOnline: isOnline
            });
        } catch (error) {
            console.error('Error broadcasting status:', error);
        }
    });
    
    socket.on('request_user_status', ({ requesterId, userId }) => {
        console.log(`User ${requesterId} requested status for user ${userId}`);
        
        // Forward the request to all clients
        // The client with matching userId will respond
        io.emit('request_user_status', {
            requesterId: parseInt(requesterId),
            userId: parseInt(userId)
        });
    });
    
    socket.on('user_status_response', ({ responderId, requesterId, isOnline }) => {
        console.log(`User ${responderId} responding to ${requesterId} with status: ${isOnline}`);
        
        // Forward the response directly to the requester
        const requesterSocket = Array.from(io.sockets.sockets.values())
            .find(s => {
                const userData = onlineUsers.get(parseInt(requesterId));
                return userData && userData.socketId === s.id;
            });
        
        if (requesterSocket) {
            requesterSocket.emit('user_status_response', {
                responderId: parseInt(responderId),
                requesterId: parseInt(requesterId),
                isOnline: isOnline
            });
        } else {
            // Broadcast to all if we can't find the specific socket
            io.emit('user_status_response', {
                responderId: parseInt(responderId),
                requesterId: parseInt(requesterId),
                isOnline: isOnline
            });
        }
    });

    socket.on('leave_chat', ({ userId, chatId }) => {
        const roomId = [userId, chatId].sort().join('-');
        socket.leave(roomId);
        
        // Notify others that user left chat but is still online
        io.to(roomId).emit('leave_chat', {
            userId: parseInt(userId)
        });
    });

    socket.on('user_typing', ({ senderId, receiverId, userId }) => {
        console.log(`User ${senderId} is typing to ${receiverId}`);
        const roomId = [senderId, receiverId].sort().join('-');
        
        // Broadcast to the room that this user is typing
        io.in(roomId).emit('user_typing', {
            userId: parseInt(senderId)
        });
        
        // Update typing status in memory
        typingUsers.set(`${senderId}-${receiverId}`, Date.now());
        
        // Clear typing status after 3 seconds
        setTimeout(() => {
            if (typingUsers.get(`${senderId}-${receiverId}`)) {
                typingUsers.delete(`${senderId}-${receiverId}`);
            }
        }, 3000);
    });
    socket.on('user_offline', async ({ userId, lastSeen }) => {
        try {
            console.log(`User ${userId} went offline at ${lastSeen}`);
            
            // Update last seen in database
            await chatModel.updateLastSeen(parseInt(userId), 'desconectado');
            
            // Remove from memory map
            onlineUsers.delete(parseInt(userId));
            
            // Broadcast to all users that this user is offline
            io.emit('user_online_status', {
                userId: parseInt(userId),
                isOnline: false,
                lastSeen: lastSeen || new Date()
            });
        } catch (error) {
            console.error('Error updating offline status:', error);
        }
    });

    socket.on('join_group', async ({ userId, groupId }) => {
        try {
            const isMember = await groupChatModel.isMember(groupId, userId);
            if(isMember) {
                socket.join(`group_${groupId}`);
                console.log(`User ${userId} joined group ${groupId}`);
            } else {
                socket.emit('error', 'No puedes unirte a un grupo del que no eres miembro');
            }
        } catch (error) {
            console.error('Error al unirse al grupo: ', error);
            socket.emit('error', 'Error al unirse al grupo');
        }
    });
    socket.on('send_group_message', async ({senderId, groupId, message, temp_id}) => {
        try {
            const isMember = await groupChatModel.isMember(groupId, senderId);
            if(isMember) {
                const savedMessage = await groupChatModel.saveGroupMessage(senderId, groupId, message);
                io.in(`group_${groupId}`).emit('receive_group_message', {
                    id: savedMessage.id,
                    senderId: savedMessage.senderId,
                    groupId: savedMessage.groupId,
                    message: savedMessage.message,
                    created_at: savedMessage.createdAt,
                    temp_id
                });
                socket.emit('message_sent_confirmation', {
                    temp_id,
                    id: savedMessage.id
                });
            } else {
                socket.emit('error', 'No puedes enviar mensajes a grupos a los que no perteneces');
            }
        } catch (error) {
            console.error('Error al enviar mensaje de grupo:', error);
            socket.emit('error', 'Error al enviar el mensaje de grupo')
        }
    });
    socket.on('disconnect', async () => {
        // Find user by socket id
        let disconnectedUserId = null;
        for (const [userId, data] of onlineUsers.entries()) {
            if (data.socketId === socket.id) {
                disconnectedUserId = userId;
                break;
            }
        }

        if (disconnectedUserId) {
            try {
                const lastSeen = new Date();

                // Broadcast to all users that this user is offline - explicitly set isOnline to false
                io.emit('user_online_status', {
                    userId: disconnectedUserId,
                    isOnline: false,
                    lastSeen: lastSeen
                });
            } catch (error) {
                console.error('Error updating offline status:', error);
            }
        }

        console.log('Cliente desconectado');
    });
});


const PORT =  process.env.CHATS_PORT || 3001;
server.listen(PORT, () => console.log(`Service Chats running on port ${PORT}`));