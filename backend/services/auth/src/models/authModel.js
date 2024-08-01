const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (nombre, username, email, contraseña) => {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO usuarios (nombre, username, email, contraseña) VALUES (?, ?, ?, ?)";
        db.query(query, [nombre, username, email, hashedPassword], (err, result) => {
            if(err) return reject(err);
            resolve(result.insertId);
        });
    });
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

const comparePassword = (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};
  
module.exports = {
    createUser,
    findUserByEmail,
    comparePassword,
};