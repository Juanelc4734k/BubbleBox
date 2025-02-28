const db = require('../config/db');

const crear = (reel) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO reels 
        (usuario_id, archivo_video, descripcion, fecha_creacion) 
        VALUES (?, ?, ?, NOW())
      `;
      db.query(query, [reel.usuario_id, reel.archivo_video, reel.descripcion], (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  };

  const obtenerTodos = () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, u.username, u.avatar
        FROM reels r
        LEFT JOIN usuarios u ON r.usuario_id = u.id
        ORDER BY r.fecha_creacion DESC
      `;
      db.query(query, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  };

const obtenerPorId = (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM reels WHERE id = ?', [id], (error, results) => {
        if (error) reject(error);
        else resolve(results[0]);
      });
    });
  };

const obtenerPorUsuario = (usuario_id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM reels WHERE usuario_id = ? ORDER BY fecha_creacion DESC', [usuario_id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

const actualizar = (id, reel) => {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE reels SET ';
      const valores = [];
      const campos = [];
  
      if (reel.archivo_video) {
        campos.push('archivo_video = ?');
        valores.push(reel.archivo_video);
      }
      if (reel.descripcion) {
        campos.push('descripcion = ?');
        valores.push(reel.descripcion);
      }
      if (reel.usuario_id) {
        campos.push('usuario_id = ?');
        valores.push(reel.usuario_id);
      }
  
      query += campos.join(', ');
      query += ' WHERE id = ?';
      valores.push(id);
  
      db.query(query, valores, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  };

const eliminar = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM reels WHERE id = ?', [id], (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

module.exports = {
  crear,
  obtenerTodos,
  obtenerPorId,
  obtenerPorUsuario,
  actualizar,
  eliminar
};



