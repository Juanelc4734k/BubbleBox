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
    
    await authModel.guardarSecreto2FA(userId, secret.base32);
    
    
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
    
    
    
    if (!user || !user.secret2FA) {
      
      return res.status(400).json({ error: 'Usuario no encontrado o 2FA no configurado' });
    }
    
    
    
    const verified = speakeasy.totp.verify({
      secret: user.secret2FA,
      encoding: 'base32',
      token: token,
      window: 1 // Permite una ventana de 1 paso (30 segundos antes y después)
    });
    
    
    
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
  
  const { email, contraseña } = req.body;
  
  

  if (!email || !contraseña) {
    
    return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
  }

  try {
    
    const user = await authModel.findUserByEmail(email);
    

    if (!user) {
      
      return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
    }

    
    const isMatch = await authModel.comparePassword(contraseña, user.contraseña);
    

    if (!isMatch) {
      
      return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
    }
    
    
    await authModel.updateUserStatus(user.id, 'conectado');
    
    
    const token = jwt.sign({ userId: user.id, rol: user.rol, estado: user.estado }, process.env.JWT_SECRET, { expiresIn: '1h' });
    

    
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
      host: 'smtp.gmail.com', // Usa el servidor SMTP de Gmail
      port: 465, // Puerto seguro (SSL)
      secure: true, // Necesario para Gmail
      auth: {
        user: process.env.EMAIL, // Tu correo de Gmail
        pass: process.env.APP_PASSWORD // La contraseña de aplicación generada
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
  
  
  try {
    // Verificar si el token existe en la base de datos
    const tokenInfo = await authModel.obtenerTokenRecuperacion(token);
    if (!tokenInfo) {
      
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    

    // Verificar si el token ha expirado
    if (tokenInfo.token_expiracion < Date.now()) {
      
      await authModel.eliminarTokenRecuperacion(token);
      return res.status(400).json({ error: 'Token expirado' });
    }

    const userId = tokenInfo.id;
    const usuario = await authModel.findUserById(userId);
    if (!usuario) {
      
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    const bcrypt = require('bcrypt');
    const hashNuevaContrasena = await bcrypt.hash(nuevaContrasena, 10);
    await authModel.actualizarContrasena(userId, hashNuevaContrasena);
    
    // Eliminar el token de recuperación después de usarlo
    await authModel.eliminarTokenRecuperacion(token);
    
    
    res.status(200).json({ mensaje: 'Contraseña restablecida exitosamente' });
  } catch (error) {
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

const checkEmail = async (req, res) => {
  const email = req.params.email;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ existe: false, error: 'Formato de email inválido' });
  }
  try {
    const usuario = await authModel.findUserByEmail(email);
    if (usuario) {
      res.status(200).json({ existe: true });
    } else {
      res.status(200).json({ existe: false });
    }
  }  
  catch (error) {
    console.error('Error al verificar el email:', error);
    res.status(500).json({ error: 'Error al verificar el email' });  
  }
}


module.exports = {
    registerUser,
    loginUser,
    recoverPassword,
    restablecerContrasena,
    logoutUser,
    generar2FA,
    verificar2FA,
    handleVerifyRole,
    checkEmail
};