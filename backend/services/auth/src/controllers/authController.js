const authModel = require('../models/authModel');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { nombre, username, email, contraseña } = req.body;
    try {
        const existingUser = await authModel.findUserByEmail(email);
        if(existingUser) {
            return res.status(400).json({ message: 'El email ya esta en uso' });
        }
        const userId = await authModel.createUser(nombre, username, email, contraseña);
        res.status(201).json({ message: 'Usuario registrado', userId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
  const { email, contraseña } = req.body;
  console.log('Intento de inicio de sesión para:', email);

  try {
    const user = await authModel.findUserByEmail(email);
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    console.log('Contraseña proporcionada:', contraseña);
    console.log('Contraseña almacenada (hasheada):', user.contraseña);

    const isMatch = await authModel.comparePassword(contraseña, user.contraseña);
    console.log('¿Contraseña coincide?', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Usuario logueado', token });
  } catch (err) {
    console.error('Error en loginUser:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
    registerUser,
    loginUser
};