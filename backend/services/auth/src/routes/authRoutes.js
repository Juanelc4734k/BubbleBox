const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.put('/logout', authMiddleware, authController.logoutUser);
router.post('/recover-password', authController.recoverPassword);
router.post('/restablecer-contrasena/:token', authController.restablecerContrasena);

module.exports = router;