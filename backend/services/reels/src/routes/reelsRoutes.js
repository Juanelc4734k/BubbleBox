const express = require('express');
const router = express.Router();
const reelsController = require('../controllers/reelsController');
const upload = require('../middleware/multer');

router.post('/crearReel', upload.single('video'), reelsController.crearReel);
router.get('/todosReels', reelsController.obtenerTodosLosReels);
router.get('/reel/:id', reelsController.obtenerReelPorId);
router.get('/reelsUsuario/:usuario_id', reelsController.obtenerReelsPorUsuario);
router.put('/actualizarReel/:id', upload.single('video'), reelsController.actualizarReel);
router.delete('/eliminarReel/:id', reelsController.eliminarReel);


module.exports = router;