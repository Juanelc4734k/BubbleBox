const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', (req, res) => {
    res.send('Service Posts is up and running!');
});

router.get('/obtener-todos', postController.getAllPosts);
router.get('/obtener/:id', postController.getPostById);
router.post('/crear', postController.createPost);
router.put('/actualizar/:id', postController.updatePost);
router.delete('/eliminar/:id', postController.deletePost);

module.exports = router;

