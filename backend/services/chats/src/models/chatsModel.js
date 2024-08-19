const db = require('../config/db');

const saveMessage = (senderId, receiverId, message) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)';
        db.query(query, [senderId, receiverId, message], (error, result) => {
            if (error) reject(error);
            else resolve({ id: result.insertId, senderId, receiverId, message, createdAt: new Date() });
        });
    });
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

module.exports = {
    saveMessage,
    getMessages,
    updateMessage,
    deleteMessage
};