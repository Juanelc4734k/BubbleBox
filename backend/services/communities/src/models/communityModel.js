const db = require('../config/db');

const crearComunidad = (nombre, descripcion, idCreador, imagen = null, privacidad) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO comunidades (nombre, descripcion, id_creador, imagen, tipo_privacidad) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [nombre, descripcion, idCreador, imagen, privacidad], (err, result) => {
            if(err) return reject(err);
            resolve(result.insertId);
        });
    });
};

const unirseAComunidad = (idUsuario, idComunidad) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO usuarios_comunidades (id_usuario, id_comunidad) VALUES (?,?)';
        db.query(query, [idUsuario, idComunidad], (err, result) => {
            if(err) return reject(err);
            resolve(result.affectedRows > 0);
        });
    });
};

const salirDeComunidad = (idUsuario, idComunidad) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM usuarios_comunidades WHERE id_usuario =? AND id_comunidad =?';
        db.query(query, [idUsuario, idComunidad], (err, result) => {
            if(err) return reject(err);
            resolve(result.affectedRows > 0);
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

const obtenerMiembrosDeComunidad = (idComunidad) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT u.*
            FROM usuarios u
            INNER JOIN usuarios_comunidades uc ON u.id = uc.id_usuario
            WHERE uc.id_comunidad = ?;
        `;
        db.query(query, [idComunidad], (err, results) => {
            if (err) {
                console.error('Error al obtener miembros de la comunidad:', err);
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

const isMember = (userId, communityId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM usuarios_comunidades WHERE id_usuario = ? AND id_comunidad = ?';
        db.query(query, [userId, communityId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0].count > 0);
        });
    });
};

module.exports = {
    crearComunidad,
    obtenerTodasLasComunidades,
    obtenerMiembrosDeComunidad,
    unirseAComunidad,
    salirDeComunidad,
    obtenerComunidadPorId,
    actualizarComunidad,
    eliminarComunidad,
    isMember
};
