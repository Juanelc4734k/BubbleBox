const friendModel = require('../models/friendModel');
const axios = require('axios');

const crearSolicitudAmistad = async (req, res) => {
  try {
    const { idUsuario1, idUsuario2 } = req.body;
    const resultado = await friendModel.crearSolicitudAmistad(idUsuario1, idUsuario2);

    if (resultado.estado === 'pendiente') {
      // Obtener el nombre del usuario que envía la solicitud
      let nombreSolicitante = 'Usuario';
      try {
        const respuestaUsuario = await axios.get(`http://localhost:3000/users/usuario/${idUsuario1}`);
        nombreSolicitante = respuestaUsuario.data.nombre;
      } catch (error) {
        console.error('Error al obtener el nombre del usuario solicitante:', error.message);
      }

      // Enviar notificación al usuario que recibe la solicitud
      try {
        await axios.post(`http://localhost:3000/notifications/send`, {
          usuario_id: idUsuario2,
          tipo: 'solicitud_amistad',
          contenido: `${nombreSolicitante} te ha enviado una solicitud de amistad`
        });
      } catch (error) {
        console.error('Error al enviar la notificación:', error.message);
      }
    }

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al procesar la solicitud de amistad', error: error.message });
  }
};

const aceptarSolicitudAmistad = async (req, res) => {
  try {
      const { id } = req.params;
      const resultado = await friendModel.aceptarSolicitudAmistad(id);
      if (resultado.success) {
          const estadoActual = await friendModel.verificarEstadoSolicitud(id);
          
          // Obtener los IDs de los usuarios involucrados
          const solicitud = await friendModel.obtenerSolicitudPorId(id);
          const idSolicitante = solicitud.id_usuario1;
          const idAceptante = solicitud.id_usuario2;

          // Obtener el nombre del usuario que aceptó la solicitud
          let nombreAceptante = 'Usuario';
          try {
              const respuestaUsuario = await axios.get(`http://localhost:3000/users/usuario/${idAceptante}`);
              nombreAceptante = respuestaUsuario.data.nombre;
          } catch (error) {
              console.error('Error al obtener el nombre del usuario aceptante:', error.message);
          }

          // Enviar notificación al usuario que envió la solicitud
          try {
              await axios.post(`http://localhost:3000/notifications/send`, {
                  usuario_id: idSolicitante,
                  tipo: 'amistad_aceptada',
                  contenido: `${nombreAceptante} ha aceptado tu solicitud de amistad`
              });
          } catch (error) {
              console.error('Error al enviar la notificación:', error.message);
          }

          res.status(200).json({ mensaje: 'Solicitud de amistad aceptada', resultado, estadoActual });
      } else {
          res.status(400).json({ mensaje: 'No se pudo aceptar la solicitud', resultado });
      }
  } catch (error) {
      res.status(500).json({ mensaje: 'Error al aceptar la solicitud de amistad', error: error.message });
  }
};

const rechazarSolicitudAmistad = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await friendModel.rechazarSolicitudAmistad(id);
    res.status(200).json({ mensaje: 'Solicitud de amistad rechazada', resultado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al rechazar la solicitud de amistad', error: error.message });
  }
};

const obtenerAmistades = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const amistades = await friendModel.obtenerAmistades(idUsuario);
    res.status(200).json(amistades);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las amistades', error: error.message });
  }
};

const eliminarAmistad = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await friendModel.eliminarAmistad(id);
    res.status(200).json({ mensaje: 'Amistad eliminada con éxito', resultado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la amistad', error: error.message });
  }
};

const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const solicitudes = await friendModel.obtenerSolicitudesPendientes(idUsuario);
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las solicitudes pendientes', error: error.message });
  }
};


module.exports = {
  crearSolicitudAmistad,
  aceptarSolicitudAmistad,
  rechazarSolicitudAmistad,
  obtenerAmistades,
  eliminarAmistad,
  obtenerSolicitudesPendientes
};
