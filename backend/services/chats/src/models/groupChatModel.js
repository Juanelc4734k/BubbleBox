const db = require('../config/db');

const createGroup = (userId, name, descripcion, imagen) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO grupos (id_creador, name, descripcion, imagen) VALUES (?, ?, ?, ?)';
        db.queryCallback(query, [userId, name, descripcion, imagen], (error, result) => {
            if (error) reject(error);
            else resolve({ id: result.insertId, name, imagen });
        });
    });
}

const saveGroupMessage = (senderId, groupId, message) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO mensajes_grupos (group_id, sender_id, message) VALUES (?, ?, ?)';
        db.queryCallback(query, [groupId, senderId, message], (error, result) => {
            if (error) reject(error);
            else resolve(result.affectedRows > 0);
        });
    });
}


const addUserToGroup = (userId, groupId) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO miembros_grupos (group_id, user_id) VALUES (?, ?)';
        db.queryCallback(query, [userId, groupId], (error, result) => {
            if (error) reject(error);
            else resolve(result.affectedRows > 0);
        });
    });
}

const getGroups = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT g.* 
            FROM grupos g 
            LEFT JOIN miembros_grupos mg ON g.id = mg.group_id 
            WHERE g.id_creador = ? OR mg.user_id = ?`;
        db.queryCallback(query, [userId, userId], (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

const getGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM grupos WHERE id =?';
        db.queryCallback(query, [groupId], (error, results) => {
            if (error) reject(error);
            else resolve(results[0]);
        });
    });
}


const getUsersByGroup = (groupId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM usuarios WHERE id IN (SELECT user_id FROM miembros_grupos WHERE group_id = ?)';
        db.queryCallback(query, [groupId], (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

const saveGroupMessageWithTimestamp = (senderId, groupId, message) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO mensajes_grupos (sender_id, group_id, message) VALUES (?, ?, ?)';
        db.queryCallback(query, [senderId, groupId, message], (error, result) => {
            if (error) reject(error);
            else resolve({ id: result.insertId, senderId, groupId, message, createdAt: new Date() });
        });
    });
}

const getGroupMessages = (groupId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM mensajes_grupos WHERE group_id = ? ORDER BY created_at ASC';
        db.queryCallback(query, [groupId], (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

const deleteGroupMessage = (messageId) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM mensajes_grupos WHERE id = ?';
        db.queryCallback(query, [messageId], (error, result) => {
            if (error) reject(error);
            else resolve(result.affectedRows > 0);
        });
    });
}

const isMember = (groupId, userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM miembros_grupos WHERE group_id = ? AND user_id = ?';
        db.queryCallback(query, [groupId, userId], (error, results) => {
            if (error) reject(error);
            else resolve(results.length > 0);
        });
    });
}

module.exports = {
    createGroup,
    saveGroupMessageWithTimestamp,
    addUserToGroup,
    getGroups,
    getGroup,
    getUsersByGroup,
    saveGroupMessage,
    getGroupMessages,
    deleteGroupMessage,
    isMember
}

