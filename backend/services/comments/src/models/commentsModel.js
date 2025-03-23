const db = require('../config/db');

const TIPO_PUBLICACION = 'publicacion';
const TIPO_REEL = 'reel';
const TIPO_HISTORIA = 'historia';

const crearComentario = (idUsuario, idContenido, tipoContenido, contenido) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO comentarios (id_usuario, id_contenido, tipo_contenido, contenido) VALUES (?, ?, ?, ?)';
    db.query(query, [idUsuario, idContenido, tipoContenido, contenido], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

// For post comments
const crearRespuestaComentarioPublicacion = (idUsuario, idComentario, contenido) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO respuestas_comentarios_publicaciones (id_usuario, id_comentario, contenido, fecha_creacion)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(query, [idUsuario, idComentario, contenido], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const obtenerRespuestasComentarioPublicacion = (idComentario) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM respuestas_comentarios_publicaciones
      WHERE id_comentario = ?
      ORDER BY fecha_creacion DESC
    `;
    db.query(query, [idComentario], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

// For reel comments
const crearRespuestaComentarioReel = (idUsuario, idComentario, contenido) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO respuestas_comentarios_reels (id_usuario, id_comentario, contenido, fecha_creacion)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(query, [idUsuario, idComentario, contenido], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const obtenerRespuestasComentarioReel = (idComentario) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM respuestas_comentarios_reels
      WHERE id_comentario = ?
      ORDER BY fecha_creacion DESC
    `;
    db.query(query, [idComentario], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const obtenerComentarios = (idContenido, tipoContenido) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM comentarios WHERE id_contenido = ? AND tipo_contenido = ?';
    db.query(query, [idContenido, tipoContenido], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

// Funciones específicas para cada tipo de contenido
const crearComentarioPublicacion = (idUsuario, idPublicacion, contenido) => {
    return crearComentario(idUsuario, idPublicacion, TIPO_PUBLICACION, contenido);
  };  

const obtenerComentariosPublicacion = (idPublicacion) => {
  return obtenerComentarios(idPublicacion, TIPO_PUBLICACION);
};

const crearComentarioReel = (idUsuario, idReel, contenido) => {
  return crearComentario(idUsuario, idReel, TIPO_REEL, contenido);
};

const obtenerComentariosReel = (idReel) => {
  return obtenerComentarios(idReel, TIPO_REEL);
};

const crearComentarioHistoria = (idUsuario, idHistoria, contenido) => {
  return crearComentario(idUsuario, idHistoria, TIPO_HISTORIA, contenido);
};

const obtenerComentariosHistoria = (idHistoria) => {
  return obtenerComentarios(idHistoria, TIPO_HISTORIA);
};

const obtenerComentarioPorId = (idComentario) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM comentarios WHERE id = ?';
    db.query(query, [idComentario], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject(new Error('Comentario no encontrado'));
      } else {
        resolve(results[0]);
      }
    });
  });
};

const obtenerInformacionPublicacion = (idPublicacion) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id_usuario FROM publicaciones WHERE id = ?';
    db.query(query, [idPublicacion], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject(new Error('Publicación no encontrada'));
      } else {
        resolve(results[0]);
      }
    });
  });
};

const obtenerComentariosPorUsuario = (idUsuario) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM comentarios WHERE id_usuario =?';
    db.query(query, [idUsuario], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const getCommentsByPosts = async (req, res) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM comentarios WHERE tipo_contenido = "publicacion"';
    db.query(query, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  })
};

const getCommentsByReels = async (req, res) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM comentarios WHERE tipo_contenido = "reel"';
    db.query(query, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  })
};

const searchComments = (query) => {
  return new Promise((resolve, reject) => {
      const searchId = parseInt(query);
      
      const searchQuery = `
          SELECT c.*, u.nombre AS username 
          FROM comentarios c
          LEFT JOIN usuarios u ON c.id_usuario = u.id
          WHERE c.id = ? OR c.contenido LIKE ?
          ORDER BY c.fecha_creacion DESC
      `;
      
      db.query(searchQuery, [searchId, `%${query}%`], (err, results) => {
          if (err) return reject(err);
          resolve(results);
      });
  });
};

const deleteComment = (commentId) => {
  return new Promise((resolve, reject) => {
      const deleteQuery = 'DELETE FROM comentarios WHERE id =?';

      db.query(deleteQuery, [commentId], (err, result) => {
          if (err) return reject(err);
          resolve(result);
      });
  });
};

module.exports = {
  crearComentarioPublicacion,
  obtenerComentariosPublicacion,
  crearComentarioReel,
  obtenerComentariosReel,
  crearComentarioHistoria,
  obtenerComentariosHistoria,
  TIPO_PUBLICACION,
  TIPO_REEL,
  TIPO_HISTORIA,
  obtenerInformacionPublicacion,
  crearRespuestaComentarioPublicacion,
  obtenerRespuestasComentarioPublicacion,
  crearRespuestaComentarioReel,
  obtenerRespuestasComentarioReel,
  obtenerComentarioPorId,
  obtenerComentariosPorUsuario,
  getCommentsByPosts,
  getCommentsByReels,
  searchComments,
  deleteComment
};

