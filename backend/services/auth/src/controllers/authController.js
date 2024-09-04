const authModel = require('../models/authModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generar2FA = async (req, res) => {
  const userId = req.user.id;
  try {
    const secret = speakeasy.generateSecret();
    console.log('Secreto 2FA generado:', secret.base32);
    await authModel.guardarSecreto2FA(userId, secret.base32);
    console.log('Secreto 2FA guardado para el usuario:', userId);
    
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        console.error('Error al generar el código QR:', err);
        return res.status(500).json({ error: 'Error al generar el código QR' });
      }
      res.json({ qrCode: data_url, secret: secret.base32 });
    });
  } catch (error) {
    console.error('Error al generar 2FA:', error);
    res.status(500).json({ error: 'Error al generar 2FA' });
  }
};

const verificar2FA = async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;
  try {
    const user = await authModel.findUserById(userId);
    console.log('Usuario encontrado:', user);
    console.log('Token recibido:', token);
    
    if (!user || !user.secret2FA) {
      console.log('Usuario no encontrado o sin secreto 2FA configurado');
      return res.status(400).json({ error: 'Usuario no encontrado o 2FA no configurado' });
    }
    
    console.log('Secreto 2FA del usuario:', user.secret2FA);
    
    const verified = speakeasy.totp.verify({
      secret: user.secret2FA,
      encoding: 'base32',
      token: token,
      window: 1 // Permite una ventana de 1 paso (30 segundos antes y después)
    });
    
    console.log('Resultado de la verificación:', verified);
    
    if (verified) {
      res.json({ mensaje: '2FA verificado correctamente' });
    } else {
      res.status(400).json({ error: 'Token 2FA inválido' });
    }
  } catch (error) {
    console.error('Error al verificar 2FA:', error);
    res.status(500).json({ error: 'Error al verificar 2FA' });
  }
};

const registerUser = async (req, res) => {
    const { nombre, username, email, contraseña } = req.body;
    
    // Validación de entrada
    if (!nombre || typeof nombre !== 'string' || nombre.length < 2 || nombre.length > 50) {
        return res.status(400).json({ mensaje: 'El nombre es inválido' });
    }
    
    if (!username || typeof username !== 'string' || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ mensaje: 'El nombre de usuario es inválido' });
    }
    
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ mensaje: 'El correo electrónico es inválido' });
    }
    
    console.log(req.body);
    try {
        const existingUser = await authModel.findUserByEmail(email);
        if(existingUser) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está en uso' });
        }
        const userId = await authModel.createUser(nombre, username, email, contraseña);
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', userId });
    } catch (err) {
        console.error('Error en el registro de usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor', detalles: err.message });
    }
};

const loginUser = async (req, res) => {
  console.log('Iniciando proceso de login');
  const { email, contraseña } = req.body;
  console.log('Email recibido:', email);
  console.log('Contraseña recibida:', contraseña ? '[REDACTED]' : 'No proporcionada');

  if (!email || !contraseña) {
    console.log('Email o contraseña faltantes');
    return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
  }

  try {
    console.log('Buscando usuario en la base de datos');
    const user = await authModel.findUserByEmail(email);
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
    }

    console.log('Comparando contraseñas');
    const isMatch = await authModel.comparePassword(contraseña, user.contraseña);
    console.log('¿Contraseña coincide?', isMatch);

    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
    }
    
    console.log('Actualizando estado del usuario');
    await authModel.updateUserStatus(user.id, 'conectado');
    
    console.log('Generando token JWT');
    const token = jwt.sign({ userId: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generado');

    console.log('Enviando respuesta');
    res.status(200).json({ mensaje: 'Usuario logueado', token, userId: user.id, rol: user.rol });
  } catch (err) {
    console.error('Error en loginUser:', err);
    res.status(500).json({ error: err.message });
  }
}

const recoverPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await authModel.findUserByEmail(email);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    const tokenUnicoUso = crypto.randomBytes(32).toString('hex');
    const tokenExpiracion = Date.now() + 3600000; // 1 hora de validez
    
    await authModel.guardarTokenRecuperacion(usuario.id, tokenUnicoUso, tokenExpiracion);
    
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    
    const enlaceRecuperacion = `http://localhost:5173/recuperar-contrasena?token=${tokenUnicoUso}`;
    
    const mailOptions = {
      from: 'noreply@bubblebox.com',
      to: email,
      subject: 'Recuperación de contraseña',
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${enlaceRecuperacion}">Restablecer contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.status(200).json({ mensaje: 'Correo de recuperación enviado' });
  } catch (err) {
    console.error('Error en recoverPassword:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud de recuperación de contraseña' });
  }
}

const restablecerContrasena = async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body;
  //console.log('Token recibido:', token);
  //console.log('Nueva contraseña recibida:', nuevaContrasena);
  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodificado.userId;
    //console.log('userId: '+ userId);
    
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

const handleVerifyRole = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    const rol = await authModel.verificarRol(userId);
    res.json({ rol });
  } catch (error) {
    console.error('Error en verificarRol:', error);
    res.status(500).json({ error: 'Error al verificar el rol' });
  }
};


module.exports = {
    registerUser,
    loginUser,
    recoverPassword,
    restablecerContrasena,
    logoutUser,
    generar2FA,
    verificar2FA,
    handleVerifyRole
};