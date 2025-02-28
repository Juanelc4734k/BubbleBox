const express = require('express');
const router = express.Router();
const reelsController = require('../controllers/reelsController');
const uploadMiddleware = require('../middleware/multer');

router.post('/crearReel', uploadMiddleware, reelsController.crearReel);
router.put('/actualizarReel/:id', uploadMiddleware, reelsController.actualizarReel);
router.get('/todosReels', reelsController.obtenerTodosLosReels);
router.get('/reel/:id', reelsController.obtenerReelPorId);
router.get('/reelsUsuario/:usuario_id', reelsController.obtenerReelsPorUsuario);
router.delete('/eliminarReel/:id', reelsController.eliminarReel);


module.exports = router;