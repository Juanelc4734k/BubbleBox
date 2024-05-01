const db = require('../db');

exports.createUser = (username, password, callback) => {
    const sql = 'INSERT INTO usuarios (nombre, contraseña) VALUES (?, ?)';
    db.query(sql, [username, password], callback);
};

exports.authenticateUser = (username, password, callback) => {
    const sql = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err || result.length === 0) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};