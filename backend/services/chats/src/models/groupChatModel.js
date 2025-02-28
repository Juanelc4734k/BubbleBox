const db = require('../config/db');

const createGroup = (name, imagen) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO grupos (name, imagen) VALUES (?, ?)';
        db.query(query, [name, imagen], (error, result) => {
            if (error) reject(error);
            else resolve({ id: result.insertId, name, imagen });
        });
    });
}

const addUserToGroup = (userId, groupId) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO miembros_grupos (group_id, user_id) VALUES (?, ?)';
        db.query(query, [userId, groupId], (error, result) => {
            if (error) reject(error);
            else resolve(result.affectedRows > 0);
        });
    });
}

const getGroups = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM grupos WHERE id IN (SELECT group_id FROM miembros_grupos WHERE user_id = ?)';
        db.query(query, [userId], (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

const getUsersByGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM usuarios WHERE id IN (SELECT user_id FROM miembros_grupos WHERE group_id = ?)';
        db.query(query, [groupId], (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

const saveGroupMessage = (senderId, groupId, message) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO mensajes_grupos (sender_id, group_id, message) VALUES (?, ?, ?)';
        db.query(query, [senderId, groupId, message], (error, result) => {
            if (error) reject(error);
            else resolve({ id: result.insertId, senderId, groupId, message, createdAt: new Date() });
        });
    });
}

const getGroupMessages = (groupId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM mensajes_grupos WHERE group_id = ? ORDER BY created_at ASC';
        db.query(query, [groupId], (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

const deleteGroupMessage = (messageId) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM mensajes_grupos WHERE id = ?';
        db.query(query, [messageId], (error, result) => {
            if (error) reject(error);
            else resolve(result.affectedRows > 0);
        });
    });
}

const isMember = (userId, groupId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM miembros_grupos WHERE user_id = ? AND group_id = ?';
        db.query(query, [userId, groupId], (error, results) => {
            if (error) reject(error);
            else resolve(results.length > 0);
        });
    });
}

module.exports = {
    createGroup,
    addUserToGroup,
    getGroups,
    getUsersByGroup,
    saveGroupMessage,
    getGroupMessages,
    deleteGroupMessage,
    isMember
}

