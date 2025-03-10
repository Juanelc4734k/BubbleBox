const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

router.post('/solicitar', friendController.crearSolicitudAmistad);
router.put('/aceptar/:id', friendController.aceptarSolicitudAmistad);
router.put('/rechazar/:id', friendController.rechazarSolicitudAmistad);
router.get('/amistades/:idUsuario', friendController.obtenerAmistades);
router.delete('/eliminar/:id', friendController.eliminarAmistad);
router.get('/solicitudes-pendientes/:idUsuario', friendController.obtenerSolicitudesPendientes);
router.post('/bloquear', friendController.bloquearUsuario);
router.post('/desbloquear', friendController.desbloquearUsuario);
router.get('/verificar-bloqueo', friendController.verificarBloqueo);
router.get('/sugerencias/:idUsuario', friendController.obtenerSugerenciasAmigos);
router.get('/amigos-comunes/:idUsuario1/:idUsuario2', friendController.obtenerAmigosEnComun);



module.exports = router;