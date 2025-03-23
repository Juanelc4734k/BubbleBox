const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (nombre, username, email, contraseña) => {
  try {
    if (!contraseña || typeof contraseña !== 'string') {
      throw new Error('La contraseña es inválida');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);
    const query = "INSERT INTO usuarios (nombre, username, email, contraseña) VALUES (?, ?, ?, ?)";
    const [result] = await db.promise().query(query, [nombre, username, email, hashedPassword]);
    return result.insertId;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw new Error('Error al crear el usuario: ' + error.message);
  }
};

const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        console.log('Iniciando búsqueda de usuario por email:', email);
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('Error al buscar usuario por email:', err);
                return reject(err);
            }
            //console.log('Resultados de la búsqueda:', results);
            if (results.length === 0) {
                console.log('No se encontró usuario con el email:', email);
                return resolve(null);
            }
            //console.log('Usuario encontrado:', results[0]);
            resolve(results[0]);
        });
    });
};

const findUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM usuarios WHERE id = ?';
        db.query(query, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

const comparePassword = (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

const loginUser = async (email, contraseña) => {
    return new Promise((resolve, reject) => {
        console.log('Iniciando consulta a la base de datos');
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return reject(err);
            }
            if (results.length === 0) {
                console.log('No se encontró usuario con ese email');
                return resolve(null);
            }
            
            const user = results[0];
            console.log('Usuario encontrado, comparando contraseñas');
            const isMatch = await bcrypt.compare(contraseña, user.contraseña);
            console.log('¿Contraseña coincide?', isMatch);
            
            if (isMatch) {
                console.log('Actualizando estado del usuario');
                const updateQuery = 'UPDATE usuarios SET estado = "conectado" WHERE id = ?';
                db.query(updateQuery, [user.id], (updateErr) => {
                    if (updateErr) {
                        console.error('Error al actualizar estado:', updateErr);
                        return reject(updateErr);
                    }
                    user.estado = "conectado";
                    console.log('Usuario actualizado correctamente');
                    resolve(user);
                });
            } else {
                console.log('Contraseña no coincide');
                resolve(null);
            }
        });
    });
};

const logoutUser = (userId) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE usuarios SET estado = "desconectado" WHERE id = ?';
      db.query(query, [userId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  const updateUserStatus = (userId, status) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE usuarios SET estado = ? WHERE id = ?';
      db.query(query, [status, userId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };
  
const actualizarContrasena = (userId, nuevaContrasena) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE usuarios SET contraseña = ? WHERE id = ?';
    db.query(query, [nuevaContrasena, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const guardarTokenRecuperacion = (userId, token, expiracion) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE usuarios SET token_recuperacion = ?, token_expiracion = ? WHERE id = ?';
    db.query(query, [token, expiracion, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const guardarSecreto2FA = (userId, secret) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE usuarios SET secret2FA = ? WHERE id = ?';
    db.query(query, [secret, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const asignarRol = async (userId, rol) => {
  const query = 'UPDATE usuarios SET rol = ? WHERE id = ?';
  await db.query(query, [rol, userId]);
};

const verificarRol = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT rol FROM usuarios WHERE id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error al verificar rol:', err);
        return reject(err);
      }
      if (results.length === 0) {
        return reject(new Error('Usuario no encontrado'));
      }
      resolve(results[0].rol);
    });
  });
};

const obtenerTokenRecuperacion = (token) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM usuarios WHERE token_recuperacion = ?';
    db.query(query, [token], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
};

const eliminarTokenRecuperacion = (token) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE usuarios SET token_recuperacion = NULL WHERE token_recuperacion = ?';
    db.query(query, [token], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
    createUser,
    loginUser,
    findUserById,
    findUserByEmail,
    comparePassword,
    logoutUser,
    updateUserStatus,
    actualizarContrasena,
    guardarTokenRecuperacion,
    guardarSecreto2FA,
    asignarRol,
    verificarRol,
    obtenerTokenRecuperacion,
    eliminarTokenRecuperacion
};