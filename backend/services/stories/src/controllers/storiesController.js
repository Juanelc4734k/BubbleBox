const storiesModel = require('../models/storiesModel');

const crearHistoria = async (req, res) => {
    try {
      let contenido;
      if (req.file) {
        contenido = req.file.path; 
      } else {
        contenido = req.body.contenido;
      }
      const nuevaHistoria = await storiesModel.crear({
        usuario_id: req.body.usuario_id,
        contenido: contenido,
        tipo: req.body.tipo
      });
      res.status(201).json({ id: nuevaHistoria, mensaje: 'Historia creada con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear la historia' });
    }
  };

const obtenerHistoriasPorUsuario = async (req, res) => {
  try {
    const historias = await storiesModel.obtenerPorUsuario(req.params.usuario_id);
    res.json(historias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las historias del usuario' });
  }
};

const obtenerTodasLasHistorias = async (req, res) => {
  try {
    const historias = await storiesModel.obtenerTodas();
    res.json(historias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las historias' });
  }
};

const registrarVistaHistoria = async (req, res) => {
  try {
    await storiesModel.registrarVista(req.params.historia_id, req.body.usuario_id);
    res.json({ mensaje: 'Vista registrada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la vista de la historia' });
  }
};

const obtenerVistasHistoria = async (req, res) => {
  try {
    const vistas = await storiesModel.obtenerVistas(req.params.historia_id);
    res.json(vistas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las vistas de la historia' });
  }
};

const eliminarHistoria = async (req, res) => {
  try {
    await storiesModel.eliminar(req.params.historia_id);
    res.json({ mensaje: 'Historia eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la historia' });
  }
};

const eliminarHistoriasExpiradas = async (req, res) => {
  try {
    await storiesModel.eliminarExpiradas();
    res.json({ mensaje: 'Historias expiradas eliminadas con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar las historias expiradas' });
  }
};

module.exports = {
  crearHistoria,
  obtenerHistoriasPorUsuario,
  obtenerTodasLasHistorias,
  registrarVistaHistoria,
  obtenerVistasHistoria,
  eliminarHistoria,
  eliminarHistoriasExpiradas
};
