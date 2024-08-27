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
      const query = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) return reject(err);
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
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(query, [email], async (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            
            const user = results[0];
            const isMatch = await bcrypt.compare(contraseña, user.contraseña);
            
            if (isMatch) {
                const updateQuery = 'UPDATE usuarios SET estado = "conectado" WHERE id = ?';
                db.query(updateQuery, [user.id], (updateErr) => {
                    if (updateErr) return reject(updateErr);
                    user.estado = "conectado";
                    resolve(user);
                });
            } else {
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

const guardarSecreto2FA = (userId, secret) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE usuarios SET secret2FA = ? WHERE id = ?';
    db.query(query, [secret, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
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
    guardarSecreto2FA
};