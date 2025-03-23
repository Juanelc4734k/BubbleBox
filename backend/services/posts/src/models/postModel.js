const db = require('../config/db');

const crearPublicacion = (titulo, contenido, idUsuario, imagen = null) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO publicaciones (titulo, contenido, id_usuario, imagen) VALUES (?, ?, ?, ?)";
        db.queryCallback(query, [titulo, contenido, idUsuario, imagen], (err, result) => {
            if(err) return reject(err);
            resolve(result.insertId);
        });
    });
};

const crearPublicacionComunidad = (titulo, contenido, idUsuario, idComunidad, imagen = null) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO publicaciones (titulo, contenido, id_usuario, id_comunidad, es_comunidad, imagen) VALUES (?, ?, ?, ?, TRUE, ?)";
        db.queryCallback(query, [titulo, contenido, idUsuario, idComunidad, imagen], (err, result) => {
            if (err) return reject(err);
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
        db.queryCallback(query, (err, results) => {
            if (err) {
                console.error('Error al obtener publicaciones:', err);
                return reject(err);
            }
            //console.log('Resultados de obtenerTodasLasPublicaciones:', results); // Asegúrate de que `nombre_usuario` está presente y tiene datos
            resolve(results);
        });
    });
};

const obtenerPublicacionesDeUsuario = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, u.nombre AS nombre_usuario, u.avatar AS avatar_usuario
            FROM publicaciones p
            LEFT JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.id_usuario =?;
        `;
        db.queryCallback(query, [id], (err, results) => {
            if (err) {
                console.error('Error al obtener publicaciones de usuario:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};

const obtenerPublicacionesDeUsuarios = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, u.nombre AS nombre_usuario, u.avatar AS avatar_usuario
            FROM publicaciones p
            LEFT JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.es_comunidad = FALSE;
        `;
        db.queryCallback(query, (err, results) => {
            if (err) {
                console.error('Error al obtener publicaciones de usuarios:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};

const obtenerPublicacionesDeComunidades = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, c.nombre AS nombre_comunidad
            FROM publicaciones p
            LEFT JOIN comunidades c ON p.id_comunidad = c.id
            WHERE p.es_comunidad = TRUE;
        `;
        db.queryCallback(query, (err, results) => {
            if (err) {
                console.error('Error al obtener publicaciones de comunidades:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};

const obtenerPublicacionesDeComunidad = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, c.nombre AS nombre_comunidad, u.nombre AS nombre_usuario, u.avatar AS avatar_usuario
            FROM publicaciones p
            LEFT JOIN comunidades c ON p.id_comunidad = c.id
            LEFT JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.es_comunidad = TRUE AND p.id_comunidad = ?;
        `;
        db.queryCallback(query, [id], (err, results) => {
            if (err) {
                console.error('Error al obtener publicaciones de comunidades:', err);
                return reject(err);
            }
            resolve(results);
        });
    });
};


const obtenerPublicacionPorId = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM publicaciones WHERE id = ?';
        db.queryCallback(query, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

const isPostEditable = (creationDate, timeLimit = 24) => {
    const postDate = new Date(creationDate);
    const currentDate = new Date();
    const hoursDifference = (currentDate - postDate) / (1000 * 60 * 60);
    return hoursDifference <= timeLimit;
}

const actualizarPublicacion = (id, titulo, contenido, imagen = null) => {
    return new Promise((resolve, reject) => {
        // First check if the post exists and is still editable
        db.queryCallback('SELECT fecha_creacion FROM publicaciones WHERE id = ?', [id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(false);
            
            const post = results[0];
            // Check if post is still within editable time frame (24 hours)
            if (!isPostEditable(post.fecha_creacion)) {
                return resolve({ updated: false, reason: 'expired' });
            }
            
            // If post is editable, proceed with update
            let query = 'UPDATE publicaciones SET titulo = ?, contenido = ?';
            let params = [titulo, contenido];

            if (imagen !== null) {
                query += ', imagen = ?';
                params.push(imagen);
            }

            query += ' WHERE id = ?';
            params.push(id);

            db.queryCallback(query, params, (err, result) => {
                if (err) return reject(err);
                resolve({ updated: result.affectedRows > 0, reason: 'success' });
            });
        });
    });
};

const eliminarPublicacion = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM publicaciones WHERE id = ?';
        db.queryCallback(query, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows > 0);
        });
    });
};

const searchPosts = (query) => {
    return new Promise((resolve, reject) => {
        const searchId = parseInt(query);
        
        const searchQuery = `
            SELECT p.*, u.nombre AS username 
            FROM publicaciones p
            LEFT JOIN usuarios u ON p.id_usuario = u.id
            WHERE p.id = ? OR p.titulo LIKE ?
            ORDER BY p.fecha_creacion DESC
        `;
        
        db.queryCallback(searchQuery, [searchId, `%${query}%`], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getNewsCount = (lastChecked) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT COUNT(*) AS count
            FROM publicaciones
            WHERE es_comunidad = FALSE
            AND fecha_creacion > FROM_UNIXTIME(? / 1000)
        `;
        db.queryCallback(query, [lastChecked], (err, results) => {
            if (err) return reject(err);
            resolve(results[0].count);
        });
    });
};

module.exports = {
    crearPublicacion,
    obtenerTodasLasPublicaciones,
    obtenerPublicacionPorId,
    actualizarPublicacion,
    eliminarPublicacion,
    obtenerPublicacionesDeUsuarios,
    obtenerPublicacionesDeUsuario,
    obtenerPublicacionesDeComunidades,
    obtenerPublicacionesDeComunidad,
    crearPublicacionComunidad,
    searchPosts,
    getNewsCount    
};