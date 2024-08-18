const db = require('../config/db');

const crear = (historia) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO historias (usuario_id, contenido, tipo, fecha_creacion, fecha_expiracion)
      VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `;
    db.query(query, [historia.usuario_id, historia.contenido, historia.tipo], (error, results) => {
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
    db.query(query, [usuario_id], (error, results) => {
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
    db.query(query, (error, results) => {
      if (error) reject(error);
      else resolve(results);
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
    db.query(query, [historia_id, usuario_id], (error, results) => {
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
    db.query(query, [historia_id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const eliminar = (historia_id) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM historias WHERE id = ?';
    db.query(query, [historia_id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const eliminarExpiradas = () => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM historias WHERE fecha_expiracion <= NOW()';
    db.query(query, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

module.exports = {
  crear,
  obtenerPorUsuario,
  obtenerTodas,
  registrarVista,
  obtenerVistas,
  eliminar,
  eliminarExpiradas
};
