const db = require('../db');

exports.createUser = (nombre, email, telefono, contraseña, callback) => {
    const sql = 'INSERT INTO usuarios (nombre, email, telefono, contraseña) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre, email, telefono, contraseña], callback);
};

exports.authenticateUser = (nombre, contraseña, callback) => {
    const sql = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?';
    db.query(sql, [nombre, contraseña], (err, result) => {
        if (err || result.length === 0) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};