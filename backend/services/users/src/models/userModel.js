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
  
  const updatePrivacySettings = (userId, privacidad) => {
    return new Promise((resolve, reject) => {
      // First check if settings exist for this user
      db.query('SELECT * FROM configuraciones_usuario WHERE usuario_id = ?', [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        
        if (results.length === 0) {
          // If no settings exist, create a new record
          db.query('INSERT INTO configuraciones_usuario (usuario_id, privacidad) VALUES (?, ?)', 
            [userId, privacidad], (insertError) => {
            if (insertError) {
              reject(insertError);
              return;
            }
            resolve({ success: true });
          });
        } else {
          // If settings exist, update the privacy setting
          db.query('UPDATE configuraciones_usuario SET privacidad = ? WHERE usuario_id = ?', 
            [privacidad, userId], (updateError) => {
            if (updateError) {
              reject(updateError);
              return;
            }
            resolve({ success: true });
          });
        }
      });
    });
  };

  const updateUserSettings = (userId, settings) => {
    return new Promise((resolve, reject) => {
      // First check if settings exist for this user
      db.query('SELECT * FROM configuraciones_usuario WHERE usuario_id = ?', [userId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        
        if (results.length === 0) {
          // If no settings exist, create a new record with all provided settings
          const query = `
            INSERT INTO configuraciones_usuario 
            (usuario_id, privacidad, notificaciones, audio_enabled, files_access_enabled, 
             online_visibility, idioma, mostrar_cumpleanos, autoplay_videos) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          db.query(query, [
            userId, 
            settings.privacidad || 'publico',
            settings.notificaciones !== undefined ? settings.notificaciones : true,
            settings.audio_enabled !== undefined ? settings.audio_enabled : true,
            settings.files_access_enabled !== undefined ? settings.files_access_enabled : true,
            settings.online_visibility !== undefined ? settings.online_visibility : true,
            settings.idioma || 'es',
            settings.mostrar_cumpleanos !== undefined ? settings.mostrar_cumpleanos : true,
            settings.autoplay_videos !== undefined ? settings.autoplay_videos : true
          ], (insertError) => {
            if (insertError) {
              reject(insertError);
              return;
            }
            resolve({ success: true });
          });
        } else {
          // If settings exist, update only the provided settings
          let updateFields = [];
          let updateValues = [];
          
          // Only include fields that are provided in the settings object
          if (settings.privacidad !== undefined) {
            updateFields.push('privacidad = ?');
            updateValues.push(settings.privacidad);
          }
          if (settings.notificaciones !== undefined) {
            updateFields.push('notificaciones = ?');
            updateValues.push(settings.notificaciones);
          }
          if (settings.audio_enabled !== undefined) {
            updateFields.push('audio_enabled = ?');
            updateValues.push(settings.audio_enabled);
          }
          if (settings.files_access_enabled !== undefined) {
            updateFields.push('files_access_enabled = ?');
            updateValues.push(settings.files_access_enabled);
          }
          if (settings.online_visibility !== undefined) {
            updateFields.push('online_visibility = ?');
            updateValues.push(settings.online_visibility);
          }
          if (settings.idioma !== undefined) {
            updateFields.push('idioma = ?');
            updateValues.push(settings.idioma);
          }
          if (settings.mostrar_cumpleanos !== undefined) {
            updateFields.push('mostrar_cumpleanos = ?');
            updateValues.push(settings.mostrar_cumpleanos);
          }
          if (settings.autoplay_videos !== undefined) {
            updateFields.push('autoplay_videos = ?');
            updateValues.push(settings.autoplay_videos);
          }
          
          // Add userId to values array
          updateValues.push(userId);
          
          // If no fields to update, just resolve
          if (updateFields.length === 0) {
            resolve({ success: true });
            return;
          }
          
          const query = `UPDATE configuraciones_usuario SET ${updateFields.join(', ')} WHERE usuario_id = ?`;
          
          db.query(query, updateValues, (updateError) => {
            if (updateError) {
              reject(updateError);
              return;
            }
            resolve({ success: true });
          });
        }
      });
    });
  };


  const getUserSettings = (userId) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM configuraciones_usuario WHERE usuario_id = ?', [userId], (error, results) => {
        if (error) reject(error);
        // If no settings found, return default values
        if (results.length === 0) {
          resolve({
            privacidad: 'publico',
            notificaciones: true,
            audio_enabled: true,
            files_access_enabled: true,
            online_visibility: true,
            idioma: 'es',
            autoplay_videos: true
          });
        } else {
          resolve(results[0]);
        }
      });
    });
  };

const checkFriendship = (userId1, userId2) => {
  return new Promise((resolve, reject) => {
    if (!userId1 || !userId2) resolve(false);
    
    const query = `
      SELECT * FROM amistades 
      WHERE (id_usuario1 = ? AND id_usuario2 = ?) 
      OR (id_usuario1 = ? AND id_usuario2 = ?)
      AND estado = 'aceptada'
    `;
    
    db.query(query, [userId1, userId2, userId2, userId1], (error, results) => {
      if (error) reject(error);
      resolve(results.length > 0);
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

  const suspendUser = (id, estado) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE usuarios SET estado = ? WHERE id = ?', [estado, id], (error, result) => {
        if (error) reject(error);
        resolve(result.affectedRows > 0);
      });
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
    // Add parameter for email search that was missing in the array
    db.query(
      'SELECT id, nombre, username, email, avatar, estado, descripcion_usuario, created_at FROM usuarios WHERE id LIKE ? OR nombre LIKE ? OR username LIKE ? OR email LIKE ?', 
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`],
      (error, results) => {
        if (error) {
          console.error('Error searching users:', error);
          reject(error);
        }
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

const addUserInterests = (userId, interests) => {
  return new Promise((resolve, reject) => {
    // First delete existing interests for this user
    db.query('DELETE FROM intereses WHERE user_id = ?', [userId], (deleteError) => {
      if (deleteError) {
        reject(deleteError);
        return;
      }

      // If there are no interests to add, resolve immediately
      if (!interests || interests.length === 0) {
        resolve(true);
        return;
      }

      // Prepare the values for multiple inserts
      const values = interests.map(interest => [userId, interest]);
      const placeholders = values.map(() => '(?, ?)').join(', ');
      const flatValues = values.flat();

      // Then insert new interests
      const query = `INSERT INTO intereses (user_id, interes) VALUES ${placeholders}`;
      
      db.query(query, flatValues, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      });
    });
  });
};

const getUserInterests = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT interes FROM intereses WHERE user_id =?', [userId], (error, results) => {
      if (error) reject(error);
      resolve(results.map(row => row.interes));
    });
  });
};

const updateUserInterests = (userId, interests) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM intereses WHERE user_id =?', [userId], (error, result) => {
      if (error) reject(error);
      addUserInterests(userId, interests).then(resolve).catch(reject);
    });
  });
};

const deleteUserInterests = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM intereses WHERE user_id =?', [userId], (error, result) => {
      if (error) reject(error);
      resolve(result.affectedRows > 0);
    });
  });
};

const updateUserStatus = (userId, status) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE usuarios SET estado =? WHERE id =?', [status, userId], (error, result) => {
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
  changePassword,
  suspendUser,

  addUserInterests,
  getUserInterests,
  updateUserInterests,
  deleteUserInterests,

  updatePrivacySettings,
  getUserSettings,
  updateUserStatus,
  updateUserSettings,
  checkFriendship,
};