const express = require("express");
const router = express.Router();
const commentsController = require('../controllers/commentsController');

// Rutas para comentarios de publicaciones
router.post('/publicaciones/:idPublicacion/comentarios', commentsController.crearComentarioPublicacion);
router.get('/publicaciones/:idPublicacion/comentarios', commentsController.obtenerComentariosPublicacion);

// Rutas para comentarios de reels
router.post('/reels/:idReel/comentarios', commentsController.crearComentarioReel);
router.get('/reels/:idReel/comentarios', commentsController.obtenerComentariosReel);

// Rutas para comentarios de historias
router.post('/historias/:idHistoria/comentarios', commentsController.crearComentarioHistoria);
router.get('/historias/:idHistoria/comentarios', commentsController.obtenerComentariosHistoria);


module.exports = router;