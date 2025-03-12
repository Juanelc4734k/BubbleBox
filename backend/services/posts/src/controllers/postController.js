const postModel = require('../models/postModel');
const friendModel = require('../../../friendships/src/models/friendModel');
const axios = require('axios');

const getAllPosts = async (req, res) => {
    try {
        const posts = await postModel.obtenerTodasLasPublicaciones();
        //console.log('Posts obtenidos en el controlador:', JSON.stringify(posts, null, 2));
        res.json(posts);
    } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener las publicaciones', error: error.message });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const posts = await postModel.obtenerPublicacionesDeUsuarios();
        res.json(posts);
    } catch (error) {
        console.error('Error al obtener las publicaciones de usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener las publicaciones de usuarios', error: error.message });
    }
};

const getUserPostsById = async (req, res) => {
    try {
        const posts = await postModel.obtenerPublicacionesDeUsuario(req.params.id);
        res.json(posts);
    } catch (error) {
        console.error('Error al obtener las publicaciones de usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener las publicaciones de usuarios', error: error.message });
    }
};

const getCommunityPosts = async (req, res) => {
    try {
        const posts = await postModel.obtenerPublicacionesDeComunidades();
        res.json(posts);
    } catch (error) {
        console.error('Error al obtener las publicaciones de comunidades:', error);
        res.status(500).json({ mensaje: 'Error al obtener las publicaciones de comunidades', error: error.message });
    }
};

const getCommunityPostsById = async (req, res) => {
    try {
        const posts = await postModel.obtenerPublicacionesDeComunidad(req.params.id);
        res.json(posts);
    } catch (error) {
        console.error('Error al obtener las publicaciones de comunidades:', error);
        res.status(500).json({ mensaje: 'Error al obtener las publicaciones de comunidades', error: error.message });
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
        const { titulo, contenido, idUsuario } = req.body;
        const imagen = req.file ? req.file.filename : null;

        const nuevoPostId = await postModel.crearPublicacion(titulo, contenido, idUsuario, imagen);

        const amigos = await friendModel.obtenerAmistades(idUsuario);

        let nombreUsuarioCreador = 'Usuario';
        try {
            const usuarioCreador = await axios.get(`http://localhost:3000/users/usuario/${idUsuario}`);
            nombreUsuarioCreador = usuarioCreador.data.nombre;
        } catch (error) {
            console.error('Error al obtener el usuario creador:', error.message);
        }

        // Send notifications to friends, excluding the post creator
        for (const amigo of amigos) {
            // Determine which ID in the friendship is the friend's ID
            let amigoId;
            if (amigo.id_usuario1 === parseInt(idUsuario)) {
                amigoId = amigo.id_usuario2;
            } else if (amigo.id_usuario2 === parseInt(idUsuario)) {
                amigoId = amigo.id_usuario1;
            }
            
            try {
                await axios.post(`http://localhost:3000/notifications/send`, {
                    usuario_id: amigoId,
                    tipo: 'post',
                    contenido: `Tu amigo ${nombreUsuarioCreador} ha creado una nueva publicación`
                });
            } catch (error) {
                console.error('Error al enviar la notificación:', error.message);
            }
        }

        res.status(201).json({ mensaje: 'Publicación creada con éxito', id: nuevoPostId });
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ mensaje: 'Error al crear la publicación', error: error.message });
    }
};

const crearPublicacionComunidad = async (req, res) => {
    try {
        const { titulo, contenido, idUsuario, idComunidad } = req.body;
        const imagen = req.file ? req.file.path : null;
        
        const nuevoPostId = await postModel.crearPublicacionComunidad(titulo, contenido, idUsuario, idComunidad, imagen);
        res.status(201).json({ mensaje: 'Publicación de comunidad creada con éxito', id: nuevoPostId });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear la publicación de comunidad', error: error.message });
    }
};


const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, imagen } = req.body;
        const result = await postModel.actualizarPublicacion(id, titulo, contenido, imagen);
        
        if (result.updated) {
            res.json({ mensaje: 'Publicación actualizada con éxito' });
        } else if (result.reason === 'expired') {
            res.status(403).json({ mensaje: 'No se puede editar la publicación después de 24 horas' });
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

const searchPosts = async (req, res) => {
    try {
        const query = req.params.query || req.query.query;
        if (!query) {
            return res.status(400).json({ mensaje: 'Se requiere un término de búsqueda' });
        }
        const posts = await postModel.searchPosts(query);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar publicaciones', error: error.message });
    }
};

const getNewsCount = async (req, res) => {
    try {
        const count = await postModel.getNewsCount(req.query.lastChecked);
        res.json({ count }); // Changed from newsCount to count
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el recuento de noticias', error: error.message });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    crearPublicacionComunidad,
    updatePost,
    deletePost,
    getUserPosts,
    getUserPostsById,
    getCommunityPosts,
    getCommunityPostsById,
    searchPosts,
    getNewsCount
};
