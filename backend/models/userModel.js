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

exports.getUserRole = (nombre, callback) => {
    const sql = 'SELECT r.nombre AS rol FROM usuarios u INNER JOIN roles r ON u.id_rol = r.id_rol WHERE u.nombre = ?';
    db.query(sql, [nombre], (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (result.length === 0) {
            callback({ message: 'Usuario no encontrado' }, null);
            return;
        }

        const rol = result[0].rol;
        callback(null, rol);
    });
};