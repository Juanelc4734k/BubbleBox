const reelsModel = require('../models/reelsModel');

const crearReel = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ mensaje: "No se ha subido ningún archivo" });
      }
  
      const nuevoReel = {
        usuario_id: req.body.usuario_id,
        archivo_video: req.file.path, // Usa la ruta del archivo guardado por multer
        descripcion: req.body.descripcion
      };
  
      const resultado = await reelsModel.crear(nuevoReel);
      res.status(201).json({ mensaje: "Reel creado con éxito", id: resultado.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al crear el reel", error: error.message });
    }
  };

const obtenerTodosLosReels = async (req, res) => {
  try {
    const reels = await reelsModel.obtenerTodos();
    res.status(200).json(reels);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los reels', error: error.message });
  }
};

const obtenerReelPorId = async (req, res) => {
  try {
    const reel = await reelsModel.obtenerPorId(req.params.id);
    if (reel) {
      res.status(200).json(reel);
    } else {
      res.status(404).json({ mensaje: 'Reel no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el reel', error: error.message });
  }
};

const obtenerReelsPorUsuario = async (req, res) => {
  try {
    const reels = await reelsModel.obtenerPorUsuario(req.params.usuario_id);
    res.status(200).json(reels);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los reels del usuario', error: error.message });
  }
};

const actualizarReel = async (req, res) => {
    try {
      const id = req.params.id;
      
      // Primero, obtener el reel actual
      const reelActual = await reelsModel.obtenerPorId(id);
      if (!reelActual) {
        return res.status(404).json({ mensaje: "Reel no encontrado" });
      }
  
      // Preparar el objeto de actualización
      const reelActualizado = {
        archivo_video: req.file ? req.file.path : reelActual.archivo_video,
        descripcion: req.body.descripcion !== undefined ? req.body.descripcion : reelActual.descripcion,
        usuario_id: req.body.usuario_id || reelActual.usuario_id
      };
  
      // Realizar la actualización
      const resultado = await reelsModel.actualizar(id, reelActualizado);
      
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: "No se pudo actualizar el reel" });
      }
      
      res.json({ mensaje: "Reel actualizado con éxito", reel: reelActualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al actualizar el reel", error: error.message });
    }
  };

const eliminarReel = async (req, res) => {
  try {
    const resultado = await reelsModel.eliminar(req.params.id);
    if (resultado.affectedRows > 0) {
      res.status(200).json({ mensaje: 'Reel eliminado exitosamente' });
    } else {
      res.status(404).json({ mensaje: 'Reel no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el reel', error: error.message });
  }
};

module.exports = {
  crearReel,
  obtenerTodosLosReels,
  obtenerReelPorId,
  obtenerReelsPorUsuario,
  actualizarReel,
  eliminarReel
};
