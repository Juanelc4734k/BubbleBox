const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../../../auth/src/middleware/auth');
const checkRol = require('../../../auth/src/middleware/checkRole');
const upload = require('../middleware/multer');

router.get('/usuarios', userController.getAllUsers);
router.get('/usuario/:id', userController.getUserById);
router.post('/crear-usuario', userController.createUser);
router.put('/actualizar-usuario/:id', userController.updateUser);
router.delete('/eliminar-usuario/:id', checkRol(['administrador']), userController.deleteUser);
router.get('/buscar-usuarios/:query', userController.searchUsers);
router.get('/perfil', authMiddleware, userController.getCurrentUserProfile);
router.get('/perfil/:id', userController.getPublicUserProfile);
router.put('/actualizar-foto-perfil', authMiddleware, upload.single('imagen'), userController.updateProfilePhoto);
router.put('/cambiar-contrasena', authMiddleware, userController.changePassword);

module.exports = router;