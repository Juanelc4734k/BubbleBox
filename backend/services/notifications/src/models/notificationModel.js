const db = require('../config/db');

// Modelo para crear una notificación
const crearNotificacion = (datos) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO notificaciones (usuario_id, tipo, contenido, leida, referencia_id) VALUES (?, ?, ?, ?, ?)';
        db.queryCallback(query, [datos.usuario_id, datos.tipo, datos.contenido, false, datos.referencia_id || null], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.insertId);
            }
        });
    });
};

// Modelo para obtener notificaciones por ID de usuario
const obtenerNotificacionesPorUsuario = (usuarioId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT id, usuario_id, tipo, contenido, leida, referencia_id, fecha_creacion 
            FROM notificaciones 
            WHERE usuario_id = ? 
            ORDER BY fecha_creacion DESC
        `;
        db.queryCallback(query, [usuarioId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

// Modelo para marcar una notificación como leída
const marcarComoLeida = (notificacionId) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE notificaciones SET leida = true WHERE id = ?';
        db.queryCallback(query, [notificacionId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.affectedRows > 0);
            }
        });
    });
};

// Modelo para eliminar una notificación
const eliminarNotificacion = (notificacionId) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM notificaciones WHERE id = ?';
        db.queryCallback(query, [notificacionId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.affectedRows > 0);
            }
        });
    });
};

module.exports = {
    crearNotificacion,
    obtenerNotificacionesPorUsuario,
    marcarComoLeida,
    eliminarNotificacion
};
