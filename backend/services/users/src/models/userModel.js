const db = require('../config/db');

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, nombre, username, email, avatar, estado, descripcion_usuario, created_at, rol FROM usuarios', (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
};

const getUserById = (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM usuarios WHERE id = ?', [id], (error, results) => {
        if (error) {
          console.error('Error en la consulta SQL:', error);
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  };

const createUser = (userData) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO usuarios (nombre, username, email, contraseña, avatar, estado, descripcion_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [userData.nombre, userData.username, userData.email, userData.contraseña, userData.avatar, userData.estado, userData.descripcion_usuario], 
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result && result.insertId) {
            resolve(result.insertId);
          } else {
            resolve(null);
          }
        }
      );
    });
  };

  const updateUser = (id, userData) => {
    return new Promise((resolve, reject) => {
      console.log('Actualizando usuario:', id, 'con datos:', userData);
      
      const query = `
        UPDATE usuarios 
        SET nombre = ?, 
            username = ?, 
            email = ?, 
            descripcion_usuario = ?, 
            estado = ?
        WHERE id = ?
      `;
      
      const values = [
        userData.nombre,
        userData.username,
        userData.email,
        userData.descripcion_usuario,
        userData.estado,
        id
      ];
      
      console.log('Query values:', values);
      
      db.query(query, values, (error, result) => {
        if (error) {
          console.error('Error en la actualización:', error);
          reject(error);
          return;
        }
        
        console.log('Resultado de la actualización:', result);
        resolve(result.affectedRows > 0);
      });
    });
  };

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM usuarios WHERE id = ?', [id], (error, result) => {
      if (error) reject(error);
      resolve(result.affectedRows > 0);
    });
  });
};

const searchUsers = (query) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, nombre, username, email, avatar, estado, descripcion_usuario, created_at FROM usuarios WHERE nombre LIKE ? OR username LIKE ? OR email LIKE ?', 
      [`%${query}%`, `%${query}%`, `%${query}%`], 
      (error, results) => {
        if (error) reject(error);
        resolve(results);
      }
    );
  });
};

const updateAvatar = (userId, avatarUrl) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE usuarios SET avatar = ? WHERE id = ?', [avatarUrl, userId], (error, result) => {
        if (error) reject(error);
        resolve(result.affectedRows > 0);
      });
    });
  };

const changePassword = (id, newPassword) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE usuarios SET contraseña = ? WHERE id = ?', [newPassword, id], (error, result) => {
      if (error) reject(error);
      resolve(result.affectedRows > 0);
    });
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  updateAvatar,
  changePassword
};