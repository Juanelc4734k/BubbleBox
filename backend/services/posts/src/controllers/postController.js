const postModel = require('../models/postModel');
const friendModel = require('../../../friendships/src/models/friendModel');
const axios = require('axios');

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

const getUserPosts = async (req, res) => {
    try {
        const posts = await postModel.obtenerPublicacionesDeUsuarios();
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

        const amigos = await friendModel.obtenerAmistades(idUsuario);

        let nombreUsuarioCreador = 'Usuario';
        try {
            const usuarioCreador = await axios.get(`http://localhost:3000/users/usuario/${idUsuario}`);
            nombreUsuarioCreador = usuarioCreador.data.nombre;
            //console.log(nombreUsuarioCreador);
        } catch (error) {
            console.error('Error al obtener el usuario creador:', error.message);
        }

        for (const amigo of amigos) {
            const amigoId = amigo.id_usuario1 === idUsuario ? amigo.id_usuario2 : amigo.id_usuario1;
            
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
        const { titulo, contenido, idUsuario, idComunidad, imagen } = req.body;
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
    crearPublicacionComunidad,
    updatePost,
    deletePost,
    getUserPosts,
    getCommunityPosts
};
