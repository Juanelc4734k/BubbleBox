const db = require('../config/db');

const crearPublicacion = (titulo, contenido, idUsuario, imagen = null) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO publicaciones (titulo, contenido, id_usuario, imagen) VALUES (?, ?, ?, ?)";
        db.query(query, [titulo, contenido, idUsuario, imagen], (err, result) => {
            if(err) return reject(err);
            resolve(result.insertId);
        });
    });
};

const obtenerTodasLasPublicaciones = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, u.nombre AS nombre_usuario, u.avatar AS avatar_usuario
            FROM publicaciones p
            LEFT JOIN usuarios u ON p.id_usuario = u.id;
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener publicaciones:', err);
                return reject(err);
            }
            console.log('Resultados de obtenerTodasLasPublicaciones:', results); // Asegúrate de que `nombre_usuario` está presente y tiene datos
            resolve(results);
        });
    });
};




const obtenerPublicacionPorId = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM publicaciones WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

const actualizarPublicacion = (id, titulo, contenido, imagen = null) => {
    return new Promise((resolve, reject) => {
        let query = 'UPDATE publicaciones SET titulo = ?, contenido = ?';
        let params = [titulo, contenido];

        if (imagen !== null) {
            query += ', imagen = ?';
            params.push(imagen);
        }

        query += ' WHERE id = ?';
        params.push(id);

        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows > 0);
        });
    });
};

const eliminarPublicacion = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM publicaciones WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows > 0);
        });
    });
};

module.exports = {
    crearPublicacion,
    obtenerTodasLasPublicaciones,
    obtenerPublicacionPorId,
    actualizarPublicacion,
    eliminarPublicacion
};