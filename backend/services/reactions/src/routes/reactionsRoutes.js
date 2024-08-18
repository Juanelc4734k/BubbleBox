const express = require('express');
const router = express.Router();
const reactionsController = require('../controllers/reactionsController');

router.post('/crear-reaccion', reactionsController.crearReaccion);
router.get('/reacciones-publicacion/:id_publicacion', reactionsController.obtenerReaccionesPublicacion);
router.get('/reacciones-reel/:id_reel', reactionsController.obtenerReaccionesReel);
router.get('/reacciones-historia/:id_historia', reactionsController.obtenerReaccionesHistoria);
router.delete('/eliminar-reaccion', reactionsController.eliminarReaccion);
router.put('/actualizar-reaccion', reactionsController.actualizarReaccion);

module.exports = router;