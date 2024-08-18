const commentsModel = require('../models/commentsModel');

// Controladores para comentarios de publicaciones
const crearComentarioPublicacion = async (req, res) => {
    try {
      const { idUsuario, contenido } = req.body;
      const { idPublicacion } = req.params;
      if (!idUsuario || !idPublicacion || !contenido) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }
      const resultado = await commentsModel.crearComentarioPublicacion(idUsuario, idPublicacion, contenido);
      res.status(201).json({ mensaje: 'Comentario creado con éxito', id: resultado.insertId });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el comentario', detalles: error.message });
    }
  };

const obtenerComentariosPublicacion = async (req, res) => {
  try {
    const { idPublicacion } = req.params;
    const comentarios = await commentsModel.obtenerComentariosPublicacion(idPublicacion);
    res.status(200).json(comentarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los comentarios' });
  }
};

// Controladores para comentarios de reels
const crearComentarioReel = async (req, res) => {
    try {
      const { idUsuario, contenido } = req.body;
      const { idReel } = req.params;
      if (!idUsuario || !idReel || !contenido) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }
      const resultado = await commentsModel.crearComentarioReel(idUsuario, idReel, contenido);
      res.status(201).json({ mensaje: 'Comentario creado con éxito', id: resultado.insertId });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el comentario', detalles: error.message });
    }
  };

const obtenerComentariosReel = async (req, res) => {
  try {
    const { idReel } = req.params;
    const comentarios = await commentsModel.obtenerComentariosReel(idReel);
    res.status(200).json(comentarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los comentarios' });
  }
};

// Controladores para comentarios de historias
const crearComentarioHistoria = async (req, res) => {
    try {
      const { idUsuario, contenido } = req.body;
      const { idHistoria } = req.params;
      if (!idUsuario || !idHistoria || !contenido) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }
      const resultado = await commentsModel.crearComentarioHistoria(idUsuario, idHistoria, contenido);
      res.status(201).json({ mensaje: 'Comentario creado con éxito', id: resultado.insertId });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el comentario', detalles: error.message });
    }
  };

const obtenerComentariosHistoria = async (req, res) => {
  try {
    const { idHistoria } = req.params;
    const comentarios = await commentsModel.obtenerComentariosHistoria(idHistoria);
    res.status(200).json(comentarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los comentarios' });
  }
};

module.exports = {
  crearComentarioPublicacion,
  obtenerComentariosPublicacion,
  crearComentarioReel,
  obtenerComentariosReel,
  crearComentarioHistoria,
  obtenerComentariosHistoria
};
