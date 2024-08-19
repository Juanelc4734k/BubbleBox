const db = require('../config/db');

const crearComunidad = (nombre, descripcion, idCreador, imagen = null) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO comunidades (nombre, descripcion, id_creador) VALUES (?, ?, ?)";
        db.query(query, [nombre, descripcion, idCreador], (err, result) => {
            if(err) return reject(err);
            resolve(result.insertId);
        });
    });
};

const obtenerTodasLasComunidades = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT c.*, u.nombre AS nombre_creador
            FROM comunidades c
            LEFT JOIN usuarios u ON c.id_creador = u.id;
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener comunidades:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};

const obtenerComunidadPorId = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM comunidades WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

const actualizarComunidad = (id, nombre, descripcion) => {
    return new Promise((resolve, reject) => {
        let query = 'UPDATE comunidades SET nombre = ?, descripcion = ?';
        let params = [nombre, descripcion];
        query += ' WHERE id = ?';
        params.push(id);

        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows > 0);
        });
    });
};

const eliminarComunidad = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM comunidades WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows > 0);
        });
    });
};

module.exports = {
    crearComunidad,
    obtenerTodasLasComunidades,
    obtenerComunidadPorId,
    actualizarComunidad,
    eliminarComunidad
};
