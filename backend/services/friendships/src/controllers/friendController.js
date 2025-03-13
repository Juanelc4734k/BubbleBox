const friendModel = require('../models/friendModel');
const axios = require('axios');

const crearSolicitudAmistad = async (req, res) => {
    try {
        const { idUsuario1, idUsuario2 } = req.body;
        
        if (!idUsuario1 || !idUsuario2) {
            return res.status(400).json({ mensaje: 'Se requieren ambos IDs de usuario' });
        }

        // Verificar que ambos usuarios existen antes de crear la solicitud
        try {
            const [usuario1Response, usuario2Response] = await Promise.all([
                axios.get(`http://localhost:3000/users/usuario/${idUsuario1}`),
                axios.get(`http://localhost:3000/users/usuario/${idUsuario2}`)
            ]);

            if (!usuario1Response.data || !usuario2Response.data) {
                return res.status(404).json({ 
                    mensaje: 'Uno o ambos usuarios no existen',
                    error: 'USER_NOT_FOUND'
                });
            }

            const resultado = await friendModel.crearSolicitudAmistad(idUsuario1, idUsuario2);

            if (resultado.estado === 'pendiente' && resultado.id) {
                const nombreSolicitante = usuario1Response.data.nombre || 'Usuario';

                try {
                    await axios.post(`http://localhost:3000/notifications/send`, {
                        usuario_id: idUsuario2,
                        tipo: 'solicitud_amistad',
                        contenido: `${nombreSolicitante} te ha enviado una solicitud de amistad`,
                        referencia_id: resultado.id
                    });
                    console.log('Notificación enviada con referencia_id:', resultado.id);
                } catch (error) {
                    console.error('Error al enviar la notificación:', error.message);
                }
            }

            res.status(201).json(resultado);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ 
                    mensaje: 'Uno o ambos usuarios no existen',
                    error: 'USER_NOT_FOUND'
                });
            }
            throw error; // Re-throw other errors to be caught by the outer catch
        }
    } catch (error) {
        console.error('Error en crearSolicitudAmistad:', error);
        res.status(500).json({ 
            mensaje: 'Error interno al procesar la solicitud de amistad', 
            error: error.message 
        });
    }
};
const aceptarSolicitudAmistad = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ 
        success: false,
        mensaje: 'Se requiere el ID de la solicitud de amistad' 
      });
    }

    const resultado = await friendModel.aceptarSolicitudAmistad(id);
    if (!resultado.success) {
      return res.status(400).json({ 
        success: false,
        mensaje: 'No se pudo aceptar la solicitud', 
        resultado 
      });
    }

    const estadoActual = await friendModel.verificarEstadoSolicitud(id);
    if (!estadoActual) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'No se encontró la solicitud de amistad' 
      });
    }

    const solicitud = await friendModel.obtenerSolicitudPorId(id);
    if (!solicitud) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'No se encontró la solicitud de amistad' 
      });
    }

    const idSolicitante = solicitud.id_usuario1;
    const idAceptante = solicitud.id_usuario2;

    let nombreAceptante = 'Usuario';
    try {
      const respuestaUsuario = await axios.get(`http://localhost:3000/users/usuario/${idAceptante}`);
      if (respuestaUsuario.data && respuestaUsuario.data.nombre) {
        nombreAceptante = respuestaUsuario.data.nombre;
      } else {
        console.warn('No se pudo obtener el nombre del usuario aceptante');
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario aceptante:', error.message);
    }

    try {
      await axios.post(`http://localhost:3000/notifications/send`, {
        usuario_id: idSolicitante,
        tipo: 'amistad_aceptada',
        contenido: `${nombreAceptante} ha aceptado tu solicitud de amistad`,
        referencia_id: id
      });
    } catch (error) {
      console.error('Error al enviar la notificación:', error.message);
    }

    res.status(200).json({ 
      success: true,
      mensaje: 'Solicitud de amistad aceptada',
      resultado,
      estadoActual,
      solicitud
    });
  } catch (error) {
    console.error('Error en aceptarSolicitudAmistad:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error interno al aceptar la solicitud de amistad', 
      error: error.message 
    });
  }
};

const rechazarSolicitudAmistad = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ mensaje: 'Se requiere el ID de la solicitud de amistad' });
    }

    const resultado = await friendModel.rechazarSolicitudAmistad(id);
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'No se encontró la solicitud de amistad o ya fue rechazada' });
    }

    res.status(200).json({ mensaje: 'Solicitud de amistad rechazada', resultado });
  } catch (error) {
    console.error('Error en rechazarSolicitudAmistad:', error);
    res.status(500).json({ mensaje: 'Error interno al rechazar la solicitud de amistad', error: error.message });
  }
};

const obtenerAmistades = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    if (!idUsuario) {
      return res.status(400).json({ mensaje: 'Se requiere el ID del usuario' });
    }

    const amistades = await friendModel.obtenerAmistades(idUsuario);
    if (!amistades || amistades.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron amistades para este usuario' });
    }

    res.status(200).json(amistades);
  } catch (error) {
    console.error('Error en obtenerAmistades:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener las amistades', error: error.message });
  }
};

const checkFriendship = async (req, res) => {
  try {
    const { idUsuario1, idUsuario2 } = req.params;
    if (!idUsuario1 ||!idUsuario2) {
      return res.status(400).json({ mensaje: 'Se requieren idUsuario1 e idUsuario2' });
    }

    const resultado = await friendModel.checkFriendship(idUsuario1, idUsuario2);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en checkFriendship:', error);
    res.status(500).json({ mensaje: 'Error interno al verificar la amistad', error: error.message });
  }
};

const obtenerAmistadesBloqueadas = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    if (!idUsuario) {
      return res.status(400).json({ mensaje: 'Se requiere el ID del usuario' });
    }
    const amistadesBloqueadas = await friendModel.obtenerAmistadesBloqueadas(idUsuario);
    if (!amistadesBloqueadas || amistadesBloqueadas.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron amistades bloqueadas para este usuario' });
    }
    res.status(200).json(amistadesBloqueadas);
  } catch (error) {
    console.error('Error en obtenerAmistadesBloqueadas:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener las amistades bloqueadas', error: error.message });
  }
};

const eliminarAmistad = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ mensaje: 'Se requiere el ID de la amistad' });
    }

    const resultado = await friendModel.eliminarAmistad(id);
    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'No se encontró la amistad o ya fue eliminada' });
    }

    res.status(200).json({ mensaje: 'Amistad eliminada con éxito', resultado });
  } catch (error) {
    console.error('Error en eliminarAmistad:', error);
    res.status(500).json({ mensaje: 'Error interno al eliminar la amistad', error: error.message });
  }
};

const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    if (!idUsuario) {
      return res.status(400).json({ mensaje: 'Se requiere el ID del usuario' });
    }

    const solicitudes = await friendModel.obtenerSolicitudesPendientes(idUsuario);
    if (!solicitudes || solicitudes.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron solicitudes pendientes para este usuario' });
    }

    res.status(200).json(solicitudes);
  } catch (error) {
    console.error('Error en obtenerSolicitudesPendientes:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener las solicitudes pendientes', error: error.message });
  }
};

const bloquearUsuario = async (req, res) => {
  try {
    const { id_usuario1, id_usuario2 } = req.body;
    
    if (!id_usuario1 || !id_usuario2) {
      return res.status(400).json({ mensaje: 'Se requieren id_usuario1 e id_usuario2' });
    }

    if (id_usuario1 === id_usuario2) {
      return res.status(400).json({ mensaje: 'No puedes bloquearte a ti mismo' });
    }

    const resultado = await friendModel.bloquearUsuario(id_usuario1, id_usuario2);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al bloquear usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al bloquear usuario' });
  }
};

const desbloquearUsuario = async (req, res) => {
  try {
    const { id_usuario1, id_usuario2 } = req.body;
    
    if (!id_usuario1 || !id_usuario2) {
      return res.status(400).json({ mensaje: 'Se requieren id_usuario1 e id_usuario2' });
    }

    if (id_usuario1 === id_usuario2) {
      return res.status(400).json({ mensaje: 'No puedes desbloquearte a ti mismo' });
    }

    const resultado = await friendModel.desbloquearUsuario(id_usuario1, id_usuario2);
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'No se encontró un bloqueo para eliminar' });
    }
    
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al desbloquear usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al desbloquear usuario' });
  }
};

const verificarBloqueo = async (req, res) => {
  try {
    const { id_usuario1, id_usuario2 } = req.body;
    
    if (id_usuario1 === id_usuario2) {
      return res.status(400).json({ mensaje: 'No puedes verificar bloqueo contigo mismo' });
    }

    const bloqueado = await friendModel.verificarBloqueo(id_usuario1, id_usuario2);
    const mensaje = bloqueado 
      ? 'Los usuarios están bloqueados entre sí'
      : 'Los usuarios no están bloqueados entre sí';
    res.status(200).json({ bloqueado, mensaje });
  } catch (error) {
    console.error('Error al verificar bloqueo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al verificar bloqueo' });
  }
};

const obtenerSugerenciasAmigos = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const { limite } = req.query;
    const limiteDefault = 20;
    const limiteFinal = limite ? parseInt(limite) : limiteDefault;

    if (!idUsuario) {
      return res.status(400).json({ mensaje: 'Se requiere el ID del usuario' });
    }

    const sugerencias = await friendModel.obtenerSugerenciasAmigos(idUsuario, limiteFinal);
    res.status(200).json(sugerencias);
  } catch (error) {
    console.error('Error en obtenerSugerenciasAmigos:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener sugerencias de amigos', error: error.message });
  }
};

const obtenerAmigosEnComun = async (req, res) => {
  try {
    const { idUsuario1, idUsuario2 } = req.params;
    if (!idUsuario1 ||!idUsuario2) {
      return res.status(400).json({ mensaje: 'Se requieren idUsuario1 e idUsuario2' });
    }

    const amigosEnComun = await friendModel.obtenerAmigosEnComun(idUsuario1, idUsuario2);
    res.status(200).json(amigosEnComun);
  } catch (error) {
    console.error('Error en obtenerAmigosEnComun:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener amigos en común', error: error.message });
  }
};

module.exports = {
  crearSolicitudAmistad,
  aceptarSolicitudAmistad,
  rechazarSolicitudAmistad,
  obtenerAmistades,
  checkFriendship,
  obtenerAmistadesBloqueadas,
  eliminarAmistad,
  obtenerSolicitudesPendientes,
  bloquearUsuario,
  desbloquearUsuario,
  verificarBloqueo,
  obtenerSugerenciasAmigos,
  obtenerAmigosEnComun
};
