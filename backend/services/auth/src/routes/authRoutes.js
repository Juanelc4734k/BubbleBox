const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', (req, res, next) => {
    console.log('Recibida solicitud de login');
    console.log('Body:', req.body);
    next();
}, authController.loginUser);
router.put('/logout', authMiddleware, authController.logoutUser);
router.post('/recover-password', authController.recoverPassword);
router.post('/restablecer-contrasena/:token', authController.restablecerContrasena);
router.post('/generar-2fa', authMiddleware, authController.generar2FA);
router.post('/verificar-2fa', authMiddleware, authController.verificar2FA);
router.get('/verify-role', authMiddleware, authController.handleVerifyRole);

module.exports = router;