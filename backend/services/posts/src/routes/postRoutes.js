const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../middleware/multer');

router.get('/obtener-todos', postController.getAllPosts);
router.get('/usuarios', postController.getUserPosts); //Añadir documentacion a obsidian
router.get('/comunidades', postController.getCommunityPosts); //Añadir documentacion a obsidian
router.get('/comunidad/:id', postController.getCommunityPostsById); //Añadir documentacion a obsidian
router.get('/obtener/:id', postController.getPostById);
router.post('/crear', upload.single('imagen'), postController.createPost);
router.post('/crear-publicacion-comunidad', upload.single('imagen'), postController.crearPublicacionComunidad); //Añadir documentacion a obsidian
router.put('/actualizar/:id', postController.updatePost);
router.delete('/eliminar/:id', postController.deletePost);

module.exports = router;