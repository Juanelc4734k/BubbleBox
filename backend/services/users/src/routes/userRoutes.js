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
router.delete('/eliminar-usuario/:id', userController.deleteUser);
router.get('/buscar-usuarios/:query', userController.searchUsers);
router.get('/perfil', authMiddleware, userController.getCurrentUserProfile);
router.get('/perfil/:id', userController.getPublicUserProfile);
router.put('/actualizar-foto-perfil', authMiddleware, upload.single('imagen'), userController.updateProfilePhoto);
router.put('/cambiar-contrasena', authMiddleware, userController.changePassword);
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  }); 
router.post('/usuario/:id/interests', userController.updateUserInterests); 
router.get('/usuario/:id/interests', userController.getUserInterests)

router.put('/suspender-usuario/:id', userController.suspendUser);

router.put('/actualizar-privacidad', authMiddleware, userController.updatePrivacySettings);
router.get('/configuraciones/:userId', userController.getUserSettings);
router.put('/actualizar-configuraciones/:userId', authMiddleware, userController.updateUserSettings);
router.put('/:userId/status', userController.updateUserStatus);

module.exports = router;