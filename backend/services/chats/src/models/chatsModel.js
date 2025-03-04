const db = require('../config/db');
const axios = require('axios')

const saveMessage = (senderId, receiverId, message) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)';
        db.query(query, [senderId, receiverId, message], (error, result) => {
            if (error) reject(error);
            else resolve({ id: result.insertId, senderId, receiverId, message, createdAt: new Date() });
        });
    });
};

const saveMessageWithNotification = async (senderId, receiverId, message) => {
    try {
        // Save the message first
        const savedMessage = await saveMessage(senderId, receiverId, message);
        
        // Then send notification
        let nombreRemitente = 'Usuario';
        try {
            const axios = require('axios'); // Import axios here
            const respuestaUsuario = await axios.get(`http://localhost:3000/users/usuario/${senderId}`);
            nombreRemitente = respuestaUsuario.data.nombre;
            
            // Send notification
            await axios.post(`http://localhost:3000/notifications/send`, {
                usuario_id: receiverId,
                tipo: 'message',
                contenido: `Tu amigo ${nombreRemitente} te ha enviado un mensaje`
            });
            console.log(`Notification sent to user ${receiverId}`);
        } catch (error) {
            console.error('Error sending notification:', error.message);
            // We don't reject here, as the message was already saved
        }
        
        return savedMessage;
    } catch (error) {
        console.error('Error in saveMessageWithNotification:', error);
        throw error;
    }
};

const getMessages = (userId1, userId2) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC';
        db.query(query, [userId1, userId2, userId2, userId1], (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

const updateMessage = (messageId, newMessage) => {
    return new Promise((resolve, reject) => {
        const updateQuery = 'UPDATE messages SET message = ? WHERE id = ?';
        db.query(updateQuery, [newMessage, messageId], (error, result) => {
            if (error) reject(error);
            else if (result.affectedRows === 0) resolve(null);
            else {
                const selectQuery = 'SELECT * FROM messages WHERE id = ?';
                db.query(selectQuery, [messageId], (error, results) => {
                    if (error) reject(error);
                    else resolve(results[0]);
                });
            }
        });
    });
};

const deleteMessage = (messageId) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM messages WHERE id = ?';
        db.query(query, [messageId], (error, result) => {
            if (error) reject(error);
            else resolve(result.affectedRows > 0);
        });
    });
};

const updateLastSeen = (userId, status = 'conectado', lastSeen = null) => {
    return new Promise((resolve, reject) => {
        let query;
        let params;

        if (lastSeen) {
            // Use provided timestamp
            query = 'UPDATE usuarios SET estado = ?, lastSeen = ? WHERE id = ?';
            params = [status, new Date(lastSeen), userId];
        } else {
            // Use current server timestamp
            query = 'UPDATE usuarios SET estado = ?, lastSeen = NOW() WHERE id = ?';
            params = [status, userId];
        }

        db.query(query, params, (error, result) => {
            if (error) {
                console.error('Error updating lastSeen:', error);
                reject(error);
            } else {
                if (result.affectedRows === 0) {
                    console.log(`No user found with ID ${userId}`);
                    resolve(false);
                } else {
                    console.log(`Updated status to ${status} and lastSeen for user ${userId}`);
                    resolve(true);
                }
            }
        });
    });
};

const getLastSeen = (userId) => {
    return new Promise((resolve, reject) => {
        // Updated to use usuarios table instead of user_status
        const query = 'SELECT lastSeen, estado FROM usuarios WHERE id = ?';
        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Error getting user status:', error);
                reject(error);
            } else {
                const userData = results[0] || {};
                resolve({
                    lastSeen: userData.lastSeen || null,
                    isOnline: userData.estado === 'conectado'
                });
            }
        });
    });
};

module.exports = {
    saveMessage,
    saveMessageWithNotification,
    getMessages,
    updateMessage,
    deleteMessage,
    updateLastSeen,
    getLastSeen
};