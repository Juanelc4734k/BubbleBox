const db = require('../config/db');

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, nombre, username, email, avatar, estado, created_at FROM usuarios', (error, results) => {
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
          console.log('Resultado de la consulta:', results); // Log para depuración
          resolve(results[0]);
        }
      });
    });
  };

const createUser = (userData) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO usuarios (nombre, username, email, contraseña, avatar, estado) VALUES (?, ?, ?, ?, ?, ?)', 
        [userData.nombre, userData.username, userData.email, userData.contraseña, userData.avatar, userData.estado], 
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
      // Primero, obtenemos los datos actuales del usuario
      getUserById(id)
        .then(currentUser => {
          if (!currentUser) {
            reject(new Error('Usuario no encontrado'));
            return;
          }
  
          // Creamos un objeto con los datos actualizados, manteniendo los valores existentes si no se proporcionan nuevos
          const updatedData = {
            nombre: userData.nombre || currentUser.nombre,
            username: userData.username || currentUser.username,
            email: userData.email || currentUser.email,
            avatar: userData.avatar !== undefined ? userData.avatar : currentUser.avatar,
            estado: userData.estado || currentUser.estado
          };
  
          // Realizamos la actualización con los datos combinados
          db.query('UPDATE usuarios SET nombre = ?, username = ?, email = ?, avatar = ?, estado = ? WHERE id = ?', 
            [updatedData.nombre, updatedData.username, updatedData.email, updatedData.avatar, updatedData.estado, id], 
            (error, result) => {
              if (error) reject(error);
              resolve(result.affectedRows > 0);
            }
          );
        })
        .catch(reject);
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
    db.query('SELECT id, nombre, username, email, avatar, estado, created_at FROM usuarios WHERE nombre LIKE ? OR username LIKE ? OR email LIKE ?', 
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