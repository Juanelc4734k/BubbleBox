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
  obtenerInformacionPublicacion
};

