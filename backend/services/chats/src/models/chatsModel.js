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

const getMessageById = (messageId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM messages WHERE id =?';
        db.query(query, [messageId], (error, results) => {
            if (error) reject(error);
            else resolve(results[0]);
        });
    });
};

const saveAudioMessage = (messageData) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO messages (sender_id, receiver_id, audio_path, duration) VALUES (?, ?, ?, ?)';
        db.query(query, [
            messageData.sender_id,
            messageData.receiver_id,
            messageData.audio_path,
            messageData.duration
        ], (error, result) => {
            if (error) reject(error);
            else resolve({ 
                id: result.insertId, 
                senderId: messageData.sender_id, 
                receiverId: messageData.receiver_id, 
                audioPath: messageData.audio_path,
                duration: messageData.duration,
                createdAt: new Date() 
            });
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

const updateMessage = (messageId, newContent) => {
    return new Promise((resolve, reject) => {
        const updateQuery = 'UPDATE messages SET message = ? WHERE id = ?';
        db.query(updateQuery, [newContent, messageId], (error, result) => {
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

const deleteAllMessages = (userId1, userId2) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)';
        db.query(query, [userId1, userId2, userId2, userId1], (error, result) => {
            if (error) {
                console.error('Error deleting all messages:', error);
                reject(error);
            } else {
                console.log(`Deleted ${result.affectedRows} messages between users ${userId1} and ${userId2}`);
                resolve(result.affectedRows);
            }
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

const getUnreadCount = (userId, friendId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM messages WHERE sender_id = ? AND receiver_id = ? AND read_status = 0';
      db.query(query, [friendId, userId], (error, results) => {
        if (error) reject(error);
        else resolve(results[0].count);
      });
    });
  };

  const markMessagesAsRead = (userId, friendId) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE messages SET read_status = 1 WHERE sender_id = ? AND receiver_id = ? AND read_status = 0';
      db.query(query, [friendId, userId], (error, result) => {
        if (error) reject(error);
        else resolve(result.affectedRows);
      });
    });
  };

const getAudioMessageByPath = async (audioPath) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM messages WHERE audio_path = ? LIMIT 1';
        db.query(query, [audioPath], (error, results) => {
            if (error) {
                console.error('Error checking for existing audio message:', error);
                reject(error);
            } else {
                resolve(results.length > 0 ? results[0] : null);
            }
        });
    });
};

module.exports = {
    saveMessage,
    getMessageById,
    saveMessageWithNotification,
    getMessages,
    updateMessage,
    deleteMessage,
    deleteAllMessages,
    updateLastSeen,
    getLastSeen,
    saveAudioMessage,
    getUnreadCount,
    markMessagesAsRead,
    getAudioMessageByPath
};