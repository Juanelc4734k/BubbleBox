const friendModel = require('../models/friendModel');

const crearSolicitudAmistad = async (req, res) => {
  try {
    const { idUsuario1, idUsuario2 } = req.body;
    const resultado = await friendModel.crearSolicitudAmistad(idUsuario1, idUsuario2);
    res.status(201).json({ mensaje: 'Solicitud de amistad creada con éxito', resultado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la solicitud de amistad', error: error.message });
  }
};

const aceptarSolicitudAmistad = async (req, res) => {
    try {
      const { id } = req.params;
      const resultado = await friendModel.aceptarSolicitudAmistad(id);
      if (resultado.success) {
        const estadoActual = await friendModel.verificarEstadoSolicitud(id);
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
