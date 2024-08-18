const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

router.post('/solicitar', friendController.crearSolicitudAmistad);
router.put('/aceptar/:id', friendController.aceptarSolicitudAmistad);
router.put('/rechazar/:id', friendController.rechazarSolicitudAmistad);
router.get('/amistades/:idUsuario', friendController.obtenerAmistades);
router.delete('/eliminar/:id', friendController.eliminarAmistad);
router.get('/solicitudes-pendientes/:idUsuario', friendController.obtenerSolicitudesPendientes);



module.exports = router;