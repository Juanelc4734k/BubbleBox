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

// Rutas para respuestas a comentarios de publicaciones
router.post('/publicaciones/comentarios/:idComentario/respuestas', commentsController.crearRespuestaComentarioPublicacion);
router.get('/publicaciones/comentarios/:idComentario/respuestas', commentsController.obtenerRespuestasComentarioPublicacion);

// Rutas para respuestas a comentarios de reels
router.post('/reels/comentarios/:idComentario/respuestas', commentsController.crearRespuestaComentarioReel);
router.get('/reels/comentarios/:idComentario/respuestas', commentsController.obtenerRespuestasComentarioReel);

module.exports = router;