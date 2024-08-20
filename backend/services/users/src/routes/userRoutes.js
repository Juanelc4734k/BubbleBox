const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const authMiddleware = require('../../../auth/src/middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

router.get('/usuarios', userController.getAllUsers);
router.get('/usuario/:id', userController.getUserById);
router.post('/crear-usuario', userController.createUser);
router.put('/actualizar-usuario/:id', userController.updateUser);
router.delete('/eliminar-usuario/:id', userController.deleteUser);
router.get('/buscar-usuarios/:query', userController.searchUsers);
router.get('/perfil', authMiddleware, userController.getCurrentUserProfile);
router.get('/perfil/:id', userController.getPublicUserProfile);
router.put('/actualizar-foto-perfil', authMiddleware, upload.single('avatar'), userController.updateProfilePhoto);
router.put('/cambiar-contrasena', authMiddleware, userController.changePassword);

module.exports = router;