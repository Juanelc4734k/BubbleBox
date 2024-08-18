const db = require('../config/db');

const crearSolicitudAmistad = (idUsuario1, idUsuario2) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO amistades (id_usuario1, id_usuario2, estado, fecha_creacion, fecha_actualizacion) VALUES (?, ?, "pendiente", NOW(), NOW())';
    db.query(query, [idUsuario1, idUsuario2], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const aceptarSolicitudAmistad = (id) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE amistades SET estado = "aceptada", fecha_actualizacion = NOW() WHERE id = ?';
      db.query(query, [id], (error, results) => {
        if (error) reject(error);
        else {
          if (results.affectedRows > 0) {
            resolve({ success: true, message: 'Solicitud aceptada correctamente', results });
          } else {
            resolve({ success: false, message: 'No se encontró la solicitud o no se realizaron cambios', results });
          }
        }
      });
    });
  };

const rechazarSolicitudAmistad = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE amistades SET estado = "rechazada", fecha_actualizacion = NOW() WHERE id = ?';
    db.query(query, [id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const obtenerAmistades = (idUsuario) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT a.*, u1.nombre AS nombre_usuario1, u2.nombre AS nombre_usuario2
      FROM amistades a
      JOIN usuarios u1 ON a.id_usuario1 = u1.id
      JOIN usuarios u2 ON a.id_usuario2 = u2.id
      WHERE (a.id_usuario1 = ? OR a.id_usuario2 = ?) 
      AND a.estado = "aceptada"
    `;
    db.query(query, [idUsuario, idUsuario], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const eliminarAmistad = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM amistades WHERE id = ?';
    db.query(query, [id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const obtenerSolicitudesPendientes = (idUsuario) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT a.*, u.nombre AS nombre_solicitante
      FROM amistades a
      JOIN usuarios u ON a.id_usuario1 = u.id
      WHERE a.id_usuario2 = ? AND a.estado = "pendiente"
    `;
    db.query(query, [idUsuario], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const verificarEstadoSolicitud = (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT estado FROM amistades WHERE id = ?';
      pool.query(query, [id], (error, results) => {
        if (error) reject(error);
        else resolve(results[0]);
      });
    });
  };

module.exports = {
  crearSolicitudAmistad,
  aceptarSolicitudAmistad,
  rechazarSolicitudAmistad,
  obtenerAmistades,
  eliminarAmistad,
  obtenerSolicitudesPendientes,
  verificarEstadoSolicitud
};


