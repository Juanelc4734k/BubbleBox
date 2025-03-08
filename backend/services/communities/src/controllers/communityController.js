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

const getCommunityMembers = async (req, res) => {
    try {
        const miembros = await communityModel.obtenerMiembrosDeComunidad(req.params.id);
        if (miembros) {
            res.json(miembros);
        } else {
            res.status(404).json({ mensaje: 'Comunidad no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener los miembros de la comunidad:', error);
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
        const { nombre, descripcion, idCreador, privacidad } = req.body;
        const imagen = req.file ? req.file.filename : null;

        if (privacidad && !['publica', 'privada'].includes(privacidad)) {
            return res.status(400).json({ mensaje: 'Privacidad inválida' });
        }
        
        const idComunidad = await communityModel.crearComunidad(nombre, descripcion, idCreador, imagen, privacidad || 'publica');
        res.status(201).json({ mensaje: 'Comunidad creada con éxito', id: idComunidad });
    } catch (error) {
        console.error('Error al crear la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const joinCommunity = async (req, res) => {
    try {
        const { idUsuario } = req.body;
        const idComunidad = req.params.id;
        const unido = await communityModel.unirseAComunidad(idUsuario, idComunidad);
        if (unido) {
            res.json({ mensaje: 'Te has unido a la comunidad con éxito' });
        } else {
            res.status(404).json({ mensaje: 'Comunidad no encontrada' });
        }
    } catch (error) {
        console.error('Error al unirse a la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const leaveCommunity = async (req, res) => {
    try {
        const { idUsuario } = req.body;
        const idComunidad = req.params.id;
        const salido = await communityModel.salirDeComunidad(idUsuario, idComunidad);
        if (salido) {
            res.json({ mensaje: 'Has salido de la comunidad con éxito' });
        } else {
            res.status(404).json({ mensaje: 'Comunidad no encontrada' });
        }
    } catch (error) {
        console.error('Error al salir de la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const updateCommunity = async (req, res) => {
    try {
        const { nombre, descripcion, imagen } = req.body;
        console.log('Data:', nombre, descripcion)
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

const isMemberOfCommunity = async (req, res) => {
    try {
        const idComunidad = req.params.idComunidad;
        const idUsuario = req.params.idUsuario;
        
        if (!idUsuario || !idComunidad) {
            return res.status(400).json({ mensaje: 'Se requieren idUsuario y idComunidad' });
        }

        const esMiembro = await communityModel.isMember(idUsuario, idComunidad);
        res.json({ esMiembro });
    } catch (error) {
        console.error('Error al verificar si el usuario es miembro de la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const searchCommunities = async (req, res) => {
    try {
        const query = req.params.query || req.query.query;
        if (!query) {
            return res.status(400).json({ mensaje: 'Se requiere un término de búsqueda' });
        }
        const posts = await communityModel.searchCommunities(query);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar publicaciones', error: error.message });
    }
};

const suspendCommunity = async (req, res) => {
    try {
        const idComunidad = req.params.id;
        const { estado, motivo, duracion } = req.body;
        const suspendido = await communityModel.suspendCommunity(idComunidad, estado, motivo, duracion);
        if (suspendido) {
            res.json({ mensaje: 'Comunidad suspendida con éxito' });
        } else {
            res.status(404).json({ mensaje: 'Comunidad no encontrada' });
        }
    } catch (error) {
        console.error('Error al suspender la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const activateCommunity = async (req, res) => {
    try {
        const idComunidad = req.params.id;
        const { estado } = req.body;
        const activado = await communityModel.activateCommunity(idComunidad, estado);
        if (activado) {
            res.json({ mensaje: 'Comunidad activada con éxito' });
        } else {
            res.status(404).json({ mensaje: 'Comunidad no encontrada' });
        }
    } catch (error) {
        console.error('Error al activar la comunidad:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};


module.exports = {
    getAllCommunities,
    getCommunityMembers,
    getCommunityById,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    updateCommunity,
    deleteCommunity,
    isMemberOfCommunity,
    searchCommunities,
    suspendCommunity,
    activateCommunity,
};
