const storiesModel = require('../models/storiesModel');
const path = require('path');

const crearHistoria = async (req, res) => {
    try {
        if (!req.body.usuario_id) {
            return res.status(400).json({ error: 'Se requiere el ID del usuario' });
        }

        let mediaType = 'texto';
        let contenido = req.body.contenido;

        if (req.file) {
            mediaType = req.file.mimetype.startsWith('image/') ? 'imagen' : 'video';
            contenido = `/uploads/${req.file.filename}`;
        }

        const nuevaHistoria = await storiesModel.crear({
            usuario_id: req.body.usuario_id,
            contenido: contenido,
            tipo: mediaType
        });

        res.status(201).json({ 
            id: nuevaHistoria,
            mensaje: 'Historia creada con éxito',
            contenido: contenido,
            tipo: mediaType
        });
    } catch (error) {
        console.error('Error al crear historia:', error);
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

const obtenerHistoriasAmigos = async (req, res) => {
  try {
    const historias = await storiesModel.ObtenerHistoriasAmigos(req.params.usuario_id);
    res.json(historias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las historias de amigos' });
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
  obtenerHistoriasAmigos,
  registrarVistaHistoria,
  obtenerVistasHistoria,
  eliminarHistoria
};
