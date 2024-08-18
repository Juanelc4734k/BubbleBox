const postModel = require('../models/postModel');

const getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.obtenerTodasLasPublicaciones();
        console.log('Posts obtenidos en el controlador:', JSON.stringify(posts, null, 2));
        res.json(posts);
    } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener las publicaciones', error: error.message });
    }
};


const getPostById = async (req, res) => {
    try {
        const post = await postModel.obtenerPublicacionPorId(req.params.id);
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ mensaje: 'Publicación no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener la publicación', error: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { titulo, contenido, idUsuario, imagen } = req.body;
        const nuevoPostId = await postModel.crearPublicacion(titulo, contenido, idUsuario, imagen);
        res.status(201).json({ mensaje: 'Publicación creada con éxito', id: nuevoPostId });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear la publicación', error: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, imagen } = req.body;
        const actualizado = await postModel.actualizarPublicacion(id, titulo, contenido, imagen);
        if (actualizado) {
            res.json({ mensaje: 'Publicación actualizada con éxito' });
        } else {
            res.status(404).json({ mensaje: 'Publicación no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar la publicación', error: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const eliminado = await postModel.eliminarPublicacion(req.params.id);
        if (eliminado) {
            res.json({ mensaje: 'Publicación eliminada con éxito' });
        } else {
            res.status(404).json({ mensaje: 'Publicación no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar la publicación', error: error.message });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};
