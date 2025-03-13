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
const axios = require('axios');

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
app.set('io', io);


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

    socket.on('send_private_message', async ({ senderId, receiverId, message, temp_id, senderAvatar }) => {
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
                    temp_id,
                    senderAvatar
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

    socket.on('edit_message', async ({ messageId, senderId, newContent }) => {
        try {
            const message = await chatModel.getMessageById(messageId);

            if(!message) {
                socket.emit('error', 'Mensaje no encontrado');
                return;
            }

            if (message.sender_id !== parseInt(senderId)) {
                socket.emit('error', 'No puedes editar mensajes que no son tuyos');
                return;
            }

            const messageTime = new Date(message.created_at);
            const currentTime = new Date();
            const timeDifference = (currentTime - messageTime) / (1000 * 60);

            if (timeDifference > 15) {
                socket.emit('error', 'No puedes editar mensajes que han pasado más de 15 minutos');
                return;
            }

            const updatedMessage = await chatModel.updateMessage(messageId, newContent);

            if (!updatedMessage) {
                socket.emit('error', 'Error al editar el mensaje');
                return;
            }

            const roomId = [message.sender_id, message.receiver_id].sort().join('-');

            io.in(roomId).emit('message_edited', {
                id: messageId,
                senderId: parseInt(senderId),
                receiverId: message.receiver_id,
                message: newContent,
                edited: true,
                created_at: message.created_at,
                updated_at: updatedMessage.updated_at
            });

            console.log(`Message ${messageId} edited by ${senderId}`);

        } catch (error) {
            console.error('Error al editar el mensaje:', error);
            socket.emit('error', 'Error al editar el mensaje');
        }
    });


    socket.on('delete_message', async ({ messageId, senderId }) => {
        try {
            const message = await chatModel.getMessageById(messageId);

            if(!message) {
                socket.emit('error', 'Mensaje no encontrado');
                return;
            }

            if (message.sender_id !== parseInt(senderId)) {
                socket.emit('error', 'No puedes eliminar mensajes que no son tuyos');
                return;
            }

            const deleted = await chatModel.deleteMessage(messageId);
            
            const roomId = [message.sender_id, message.receiver_id].sort().join('-');
            
            if (!deleted) {
                socket.emit('error', 'Error al eliminar el mensaje');
                return;
            }


            io.in(roomId).emit('message_deleted', {
                id: messageId,
                senderId: parseInt(senderId),
                receiverId: message.receiver_id
            });

            console.log(`Message ${messageId} deleted by ${senderId}`);
        } catch (error) {
            console.error('Error al eliminar el mensaje:', error);
            socket.emit('error', 'Error al eliminar el mensaje');
        }
    });

    socket.on('delete_all_messages', async ({ userId1, userId2 }) => {
        try {
            if(!userId1 || !userId2) {
                socket.emit('error', 'Faltan datos para eliminar los mensajes');
                return;
            }

            const areFriends = await friendshipModel.checkFriendship(userId1, userId2);
            if (!areFriends) {
                socket.emit('error', 'No puedes eliminar mensajes con usuarios que no son tus amigos');
                return;
            }

            const deletedCount = await chatModel.deleteAllMessages(userId1, userId2);

            const roomId = [userId1, userId2].sort().join('-');

            io.in(roomId).emit('all_messages_deleted', {
                userId1: parseInt(userId1),
                userId2: parseInt(userId2),
                deletedCount
            });

            console.log(`All messages between ${userId1} and ${userId2} deleted`);
        } catch (error) {
            console.error('Error al eliminar los mensajes:', error);
            socket.emit('error', 'Error al eliminar los mensajes');
        }
    });

    socket.on('user_blocked', async ({ blockerId, blockedId }) => {
        try {
            // Create room ID for the chat
            const roomId = [blockerId, blockedId].sort().join('-');
            
            // Broadcast to the room that a user has been blocked
            io.in(roomId).emit('user_blocked_notification', {
                blockerId: parseInt(blockerId),
                blockedId: parseInt(blockedId)
            });
            
            console.log(`User ${blockerId} blocked user ${blockedId}`);
        } catch (error) {
            console.error('Error handling user block:', error);
            socket.emit('error', 'Error al procesar el bloqueo de usuario');
        }
    });

    socket.on('mark_messages_read', async ({ userId, friendId }) => {
        try {
            // Mark messages as read in the database
            await chatModel.markMessagesAsRead(userId, friendId);
            
            // Create room ID for the chat
            const roomId = [userId, friendId].sort().join('-');
            
            // Broadcast to the room that messages have been read
            io.in(roomId).emit('messages_read', {
                userId: parseInt(userId),
                chatId: parseInt(friendId)
            });
            
            console.log(`User ${userId} marked messages from ${friendId} as read`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
            socket.emit('error', 'Error marking messages as read');
        }
    });

    socket.on('send_audio_message', async (data) => {
        try {
            // Check if users are friends
            const areFriends = await friendshipModel.checkFriendship(data.senderId, data.receiverId);
            if (!areFriends) {
                socket.emit('error', 'No puedes enviar mensajes a usuarios que no son tus amigos');
                return;
            }
            
            // Create room ID for the chat
            const roomId = [data.senderId, data.receiverId].sort().join('-');
            
            const existingMessage = await chatModel.getAudioMessageByPath(data.audioPath);

            let savedAudio;
            if(existingMessage) {
                console.log('Audio message already exists, using existing record:', existingMessage);
                savedAudio = existingMessage;
            } else {
                const messageData = {
                    sender_id: data.senderId,
                    receiver_id: data.receiverId,
                    audio_path: data.audioPath,
                    duration: data.duration || '0:00'
                };

                // Save audio message to database
                savedAudio = await chatModel.saveAudioMessage(messageData);
                console.log('Audio message saved to database:', savedAudio);
            }

            // Log the data received for debugging
            console.log('Audio message data received:', data);

            // Broadcast to all clients in the room, including sender
            io.in(roomId).emit('receive_audio_message', {
                id: savedAudio.id,
                senderId: data.senderId,
                receiverId: data.receiverId,
                audioPath: data.audioPath,
                duration: data.duration || '0:00',
                created_at: savedAudio.createdAt,
                temp_id: data.temp_id,
                senderAvatar: data.senderAvatar
            });

            // Send confirmation back to sender
            socket.emit('audio_message_sent_confirmation', {
                temp_id: data.temp_id,
                id: savedAudio.id,
                audioPath: data.audioPath,
                duration: data.duration || '0:00'
            });
            
            // Send notification
            try {
                let nombreRemitente = 'Usuario';
                const respuestaUsuario = await axios.get(`http://localhost:3000/users/usuario/${data.senderId}`);
                nombreRemitente = respuestaUsuario.data.nombre;
                
                await axios.post(`http://localhost:3000/notifications/send`, {
                    usuario_id: data.receiverId,
                    tipo: 'message',
                    contenido: `Tu amigo ${nombreRemitente} te ha enviado un mensaje de audio`
                });
            } catch (notifError) {
                console.error('Error al enviar la notificación:', notifError.message);
            }
        } catch (error) {
            console.error('Error saving audio message:', error);
            socket.emit('error', 'Error al enviar el mensaje de audio');
        }
    });

    socket.on('user_online', async ({ userId }) => {
        try {
            const response = await axios.get(`http://localhost:3000/users/configuraciones/${userId}`);
            const userSettings = response.data;

            // Store in memory map
            onlineUsers.set(parseInt(userId), {
                socketId: socket.id,
                lastSeen: new Date(),
                visibilityEnable: userSettings.online_visibility === 1,
            });
            
            if (userSettings.online_visibility === 1) {
                // Update last seen in database - explicitly set to 'conectado'
                await chatModel.updateLastSeen(parseInt(userId), 'conectado');
                
                // Broadcast to all users that this user is online
                io.emit('user_online_status', {
                    userId: parseInt(userId),
                    isOnline: true
                });
            }
        } catch (error) {
            console.error('Error updating online status:', error);
        }
    });

    socket.on('broadcast_status', async ({ userId, isOnline }) => {
        try {
            console.log(`Broadcasting status for user ${userId}: ${isOnline ? 'online' : 'offline'}`);
            
            const response = await axios.get(`http://localhost:3000/users/configuraciones/${userId}`);
            const userSettings = response.data;

            // Update in memory
        onlineUsers.set(parseInt(userId), {
            socketId: socket.id,
            lastSeen: new Date(),
            visibilityEnabled: userSettings.online_visibility === 1
        });
        
        // Only update status and broadcast if visibility is enabled or explicitly going offline
        if (userSettings.online_visibility === 1 || !isOnline) {
            // Update database
            const status = isOnline ? 'conectado' : 'desconectado';
            await chatModel.updateLastSeen(parseInt(userId), status);
            
            // Broadcast to all connected clients
            io.emit('user_online_status', {
                userId: parseInt(userId),
                isOnline: isOnline
            });
        }
        } catch (error) {
            console.error('Error broadcasting status:', error);
        }
    });

    socket.on('visibility_change', async ({ userId, isVisible }) => {
        try {
            console.log(`User ${userId} changed visibility to ${isVisible ? 'visible' : 'invisible'}`);
            
            // Update user data in memory
            const userData = onlineUsers.get(parseInt(userId));
            if (userData) {
                userData.visibilityEnabled = isVisible;
                onlineUsers.set(parseInt(userId), userData);
            }
            
            // Update status in database based on visibility
            const status = isVisible ? 'conectado' : 'invisible';
            await chatModel.updateLastSeen(parseInt(userId), status);
            
            // Broadcast status change to all users
            if (isVisible) {
                io.emit('user_online_status', {
                    userId: parseInt(userId),
                    isOnline: true
                });
            } else {
                io.emit('user_online_status', {
                    userId: parseInt(userId),
                    isOnline: false,
                    lastSeen: new Date()
                });
            }
        } catch (error) {
            console.error('Error updating visibility:', error);
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