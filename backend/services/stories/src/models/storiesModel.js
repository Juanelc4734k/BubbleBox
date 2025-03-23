const db = require('../config/db');

const crear = (historia) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO historias (usuario_id, contenido, tipo, fecha_creacion, fecha_expiracion)
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `;
    db.queryCallback(query, [historia.usuario_id, historia.contenido, historia.tipo], (error, results) => {
      if (error) reject(error);
      else resolve(results.insertId);
    });
  });
};

const obtenerPorUsuario = (usuario_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM historias
      WHERE usuario_id = ? AND fecha_expiracion > NOW()
      ORDER BY fecha_creacion DESC
    `;
    db.queryCallback(query, [usuario_id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const obtenerTodas = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM historias
      WHERE fecha_expiracion > NOW()
      ORDER BY fecha_creacion DESC
    `;
    db.queryCallback(query, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const ObtenerHistoriasAmigos = (usuario_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      WITH amigos AS (
        SELECT 
          CASE 
            WHEN id_usuario1 = ? THEN id_usuario2 
            WHEN id_usuario2 = ? THEN id_usuario1 
          END AS amigo_id
        FROM amistades
        WHERE (id_usuario1 = ? OR id_usuario2 = ?)
        AND estado = 'aceptada'
      )
      SELECT h.*, u.username AS nombre_usuario
      FROM historias h
      JOIN usuarios u ON h.usuario_id = u.id
      JOIN amigos a ON h.usuario_id = a.amigo_id
      WHERE h.fecha_expiracion > NOW()
      ORDER BY h.fecha_creacion DESC
    `;
    db.queryCallback(query, [usuario_id, usuario_id, usuario_id, usuario_id], (error, results) => {
      if (error) {
        console.error('Error en ObtenerHistoriasAmigos:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};
const registrarVista = (historia_id, usuario_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO vistas_historias (historia_id, usuario_id, fecha_vista)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE fecha_vista = NOW()
    `;
    db.queryCallback(query, [historia_id, usuario_id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const obtenerVistas = (historia_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT u.id, u.nombre, vh.fecha_vista
      FROM vistas_historias vh
      JOIN usuarios u ON vh.usuario_id = u.id
      WHERE vh.historia_id = ?
    `;
    db.queryCallback(query, [historia_id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const eliminar = (historia_id) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM historias WHERE id = ?';
    db.queryCallback(query, [historia_id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const eliminarExpiradas = () => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM historias WHERE fecha_expiracion <= NOW()';
    db.queryCallback(query, [], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

module.exports = {
  crear,
  obtenerPorUsuario,
  obtenerTodas,
  ObtenerHistoriasAmigos,
  registrarVista,
  obtenerVistas,
  eliminar,
  eliminarExpiradas
};
