const notificationModel = require('../models/notificationModel');

const enviarNotificacion = (io) => async (req, res) => {
    
    try {
        const { usuario_id, tipo, contenido, referencia_id } = req.body;
        const notificacionId = await notificationModel.crearNotificacion({ 
            usuario_id, 
            tipo, 
            contenido, 
            referencia_id 
        });
        
        

        if (io) {
            io.to(usuario_id.toString()).emit('nueva_notificacion', { 
                id: notificacionId, 
                tipo, 
                contenido, 
                referencia_id,
                fecha_creacion: new Date(),
                leida: false,
                usuario_id
            });
            
        } else {
            console.error('El objeto io no está definido');
        }
        
        res.status(201).json({ 
            mensaje: 'Notificación enviada con éxito', 
            id: notificacionId,
            referencia_id 
        });
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Controlador para obtener notificaciones de un usuario
const obtenerNotificaciones = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const notificaciones = await notificationModel.obtenerNotificacionesPorUsuario(usuarioId);
        res.status(200).json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Controlador para marcar una notificación como leída
const marcarComoLeida = async (req, res) => {
    try {
        const { notificacionId } = req.params;
        const actualizada = await notificationModel.marcarComoLeida(notificacionId);
        if (actualizada) {
            res.status(200).json({ mensaje: 'Notificación marcada como leída' });
        } else {
            res.status(404).json({ error: 'Notificación no encontrada' });
        }
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Controlador para eliminar una notificación
const eliminarNotificacion = async (req, res) => {
    try {
        const { notificacionId } = req.params;
        const eliminada = await notificationModel.eliminarNotificacion(notificacionId);
        if (eliminada) {
            res.status(200).json({ mensaje: 'Notificación eliminada con éxito' });
        } else {
            res.status(404).json({ error: 'Notificación no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    enviarNotificacion,
    obtenerNotificaciones,
    marcarComoLeida,
    eliminarNotificacion
};



