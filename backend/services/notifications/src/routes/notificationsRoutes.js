const express = require('express');
const notificationsController = require('../controllers/notificationController');

const createRouter = (io) => {
    const router = express.Router();

    router.post('/send', notificationsController.enviarNotificacion(io));
    router.get('/usuario/:usuarioId', notificationsController.obtenerNotificaciones);
    router.put('/marcar-leida/:notificacionId', notificationsController.marcarComoLeida);
    router.delete('/eliminar/:notificacionId', notificationsController.eliminarNotificacion);

    return router;
};

module.exports = createRouter;