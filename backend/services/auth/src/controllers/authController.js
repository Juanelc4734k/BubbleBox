const authModel = require('../models/authModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
    
    // Actualizar el estado del usuario a "conectado"
    await authModel.updateUserStatus(user.id, 'conectado');
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Usuario logueado', token, userId: user.id });
  } catch (err) {
    console.error('Error en loginUser:', err);
    res.status(500).json({ error: err.message });
  }
};

const recoverPassword = async (req, res) => {
  const { email} = req.body;
  try {
    const user = await authModel.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    const mailOptions = {
      from: 'noreply@bubblebox.com',
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Haga clic en el siguiente enlace para recuperar su contraseña: http://localhost:5173/recuperar-contrasena?token=${token}`
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo de recuperación enviado' });
  }catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const restablecerContrasena = async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body;
  console.log('Token recibido:', token);
console.log('Nueva contraseña recibida:', nuevaContrasena);
  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodificado.userId;
    console.log('userId: '+ userId);
    
    const usuario = await authModel.findUserById(userId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    const bcrypt = require('bcrypt');
    const hashNuevaContrasena = await bcrypt.hash(nuevaContrasena, 10);
    await authModel.actualizarContrasena(userId, hashNuevaContrasena);
    
    res.status(200).json({ mensaje: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token expirado' });
    }
    console.error('Error en restablecerContrasena:', error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};


const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    await authModel.logoutUser(userId);
    res.status(200).json({ mensaje: "Usuario desconectado exitosamente" });
  } catch (error) {
    console.error('Error en logoutUser:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};


module.exports = {
    registerUser,
    loginUser,
    recoverPassword,
    restablecerContrasena,
    logoutUser
};