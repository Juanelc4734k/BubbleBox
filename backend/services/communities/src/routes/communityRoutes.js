const express = require('express');
const router = express.Router();
const upload = require ('../middleware/multer')
const communityController = require('../controllers/communityController');

router.get('/obtener-todas', communityController.getAllCommunities);
router.get('/obtener-miembros/:id', communityController.getCommunityMembers);
router.post('/unirse/:id', communityController.joinCommunity);
router.post('/salir/:id', communityController.leaveCommunity);
router.get('/obtener/:id', communityController.getCommunityById);
router.post('/crear', upload.single('imagen'), communityController.createCommunity);
router.put('/actualizar/:id', communityController.updateCommunity);
router.delete('/eliminar/:id', communityController.deleteCommunity);
router.get('/esMiembro/:idComunidad/:idUsuario', communityController.isMemberOfCommunity)

module.exports = router;