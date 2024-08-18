const reactionsModel = require('../models/reactionsModel');

const crearReaccion = async (req, res) => {
  try {
    const resultado = await reactionsModel.crearReaccion(req.body);
    res.status(201).json({ mensaje: 'Reacción creada con éxito', resultado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la reacción', error: error.message });
  }
};

const obtenerReaccionesPublicacion = async (req, res) => {
  try {
    const reacciones = await reactionsModel.obtenerReaccionesPublicacion(req.params.id_publicacion);
    res.status(200).json(reacciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las reacciones de la publicación', error: error.message });
  }
};

const obtenerReaccionesReel = async (req, res) => {
  try {
    const reacciones = await reactionsModel.obtenerReaccionesReel(req.params.id_reel);
    res.status(200).json(reacciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las reacciones del reel', error: error.message });
  }
};

const obtenerReaccionesHistoria = async (req, res) => {
  try {
    const reacciones = await reactionsModel.obtenerReaccionesHistoria(req.params.id_historia);
    res.status(200).json(reacciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las reacciones de la historia', error: error.message });
  }
};

const eliminarReaccion = async (req, res) => {
  try {
    const { id_usuario, id_contenido, tipo_contenido } = req.body;
    await reactionsModel.eliminarReaccion(id_usuario, id_contenido, tipo_contenido);
    res.status(200).json({ mensaje: 'Reacción eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la reacción', error: error.message });
  }
};

const actualizarReaccion = async (req, res) => {
  try {
    const resultado = await reactionsModel.actualizarReaccion(req.body);
    res.status(200).json({ mensaje: 'Reacción actualizada con éxito', resultado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la reacción', error: error.message });
  }
};

module.exports = {
  crearReaccion,
  obtenerReaccionesPublicacion,
  obtenerReaccionesReel,
  obtenerReaccionesHistoria,
  eliminarReaccion,
  actualizarReaccion
};
