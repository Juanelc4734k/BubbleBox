const communityModel = require('../models/communityModel');

const getAllCommunities = async (req, res) => {
    try {
        const comunidades = await communityModel.obtenerTodasLasComunidades();
        res.json(comunidades);
    } catch (error) {
        console.error('Error al obtener todas las comunidades:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const getCommunityById = async (req, res) => {
    try {
        const comunidad = await communityModel.obtenerComunidadPorId(req.params.id);
        if (comunidad) {
            res.json(comunidad);
        } else {
            res.status(404).json({ mensaje: 'Comunidad no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const createCommunity = async (req, res) => {
    try {
        const { nombre, descripcion, idCreador } = req.body;
        const imagen = req.file ? req.file.filename : null;
        
        const idComunidad = await communityModel.crearComunidad(nombre, descripcion, idCreador, imagen);
        res.status(201).json({ mensaje: 'Comunidad creada con éxito', id: idComunidad });
    } catch (error) {
        console.error('Error al crear la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const updateCommunity = async (req, res) => {
    try {
        const { nombre, descripcion, imagen } = req.body;
        const actualizado = await communityModel.actualizarComunidad(req.params.id, nombre, descripcion, imagen);
        if (actualizado) {
            res.json({ mensaje: 'Comunidad actualizada con éxito' });
        } else {
            res.status(404).json({ mensaje: 'Comunidad no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const deleteCommunity = async (req, res) => {
    try {
        const eliminado = await communityModel.eliminarComunidad(req.params.id);
        if (eliminado) {
            res.json({ mensaje: 'Comunidad eliminada con éxito' });
        } else {
            res.status(404).json({ mensaje: 'Comunidad no encontrada' });
        }
    } catch (error) {
        console.error('Error al eliminar la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

module.exports = {
    getAllCommunities,
    getCommunityById,
    createCommunity,
    updateCommunity,
    deleteCommunity
};
