const express = require('express');
const router = express.Router();
const multer = require('multer');
const storiesController = require('../controllers/storiesController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const upload = multer({ storage: storage });

router.post('/crear', upload.single('contenido'), storiesController.crearHistoria);
router.get('/usuario/:usuario_id', storiesController.obtenerHistoriasPorUsuario);
router.get('/todas', storiesController.obtenerTodasLasHistorias);
router.post('/:historia_id/vista', storiesController.registrarVistaHistoria);
router.get('/:historia_id/vistas', storiesController.obtenerVistasHistoria);
router.delete('/:historia_id', storiesController.eliminarHistoria);
router.delete('/expiradas', storiesController.eliminarHistoriasExpiradas);


module.exports = router;