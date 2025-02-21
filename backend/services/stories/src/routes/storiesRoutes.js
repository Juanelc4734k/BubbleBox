const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const storiesController = require('../controllers/storiesController');

router.post('/crear', upload.single('storiesContent'), storiesController.crearHistoria);
router.get('/usuario/:usuario_id', storiesController.obtenerHistoriasPorUsuario);
router.get('/todas', storiesController.obtenerTodasLasHistorias);
router.post('/:historia_id/vista', storiesController.registrarVistaHistoria);
router.get('/:historia_id/vistas', storiesController.obtenerVistasHistoria);
router.delete('/:historia_id', storiesController.eliminarHistoria);
router.delete('/expiradas', storiesController.eliminarHistoriasExpiradas);

module.exports = router;