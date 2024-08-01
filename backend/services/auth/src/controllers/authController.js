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
  
    try {
      const user = await userModel.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }
      const isMatch = await userModel.comparePassword(contraseña, user.contraseña);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Usuario logueado', token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};