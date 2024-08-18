const express = require('express');
const router = express.Router();
const reelsController = require('../controllers/reelsController');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

router.post('/crearReel', upload.single('archivoVideo'), reelsController.crearReel);
router.get('/todosReels', reelsController.obtenerTodosLosReels);
router.get('/reel/:id', reelsController.obtenerReelPorId);
router.get('/reelsUsuario/:usuario_id', reelsController.obtenerReelsPorUsuario);
router.put('/actualizarReel/:id', upload.single('archivoVideo'), reelsController.actualizarReel);
router.delete('/eliminarReel/:id', reelsController.eliminarReel);


module.exports = router;