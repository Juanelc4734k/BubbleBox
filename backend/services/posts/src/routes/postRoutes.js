const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/obtener-todos', postController.getAllPosts);
router.get('/usuarios', postController.getUserPosts); //Añadir documentacion a obsidian
router.get('/comunidades', postController.getCommunityPosts); //Añadir documentacion a obsidian
router.get('/obtener/:id', postController.getPostById);
router.post('/crear', postController.createPost);
router.post('/crear-publicacion-comunidad', postController.crearPublicacionComunidad); //Añadir documentacion a obsidian
router.put('/actualizar/:id', postController.updatePost);
router.delete('/eliminar/:id', postController.deletePost);

module.exports = router;