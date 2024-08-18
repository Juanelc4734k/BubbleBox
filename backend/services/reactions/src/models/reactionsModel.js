const db = require('../config/db');

const crearReaccion = (datos) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO reacciones (tipo, id_usuario, id_contenido, tipo_contenido) VALUES (?, ?, ?, ?)';
    db.query(query, [datos.tipo, datos.id_usuario, datos.id_contenido, datos.tipo_contenido], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const obtenerReaccionesPublicacion = (id_publicacion) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM reacciones WHERE id_contenido = ? AND tipo_contenido = "publicacion"';
    db.query(query, [id_publicacion], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const obtenerReaccionesReel = (id_reel) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM reacciones WHERE id_contenido = ? AND tipo_contenido = "reel"';
    db.query(query, [id_reel], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const obtenerReaccionesHistoria = (id_historia) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM reacciones WHERE id_contenido = ? AND tipo_contenido = "historia"';
    db.query(query, [id_historia], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const eliminarReaccion = (id_usuario, id_contenido, tipo_contenido) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM reacciones WHERE id_usuario = ? AND id_contenido = ? AND tipo_contenido = ?';
    db.query(query, [id_usuario, id_contenido, tipo_contenido], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const actualizarReaccion = (datos) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE reacciones SET tipo = ? WHERE id_usuario = ? AND id_contenido = ? AND tipo_contenido = ?';
    db.query(query, [datos.tipo, datos.id_usuario, datos.id_contenido, datos.tipo_contenido], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  crearReaccion,
  obtenerReaccionesPublicacion,
  obtenerReaccionesReel,
  obtenerReaccionesHistoria,
  eliminarReaccion,
  actualizarReaccion
};

