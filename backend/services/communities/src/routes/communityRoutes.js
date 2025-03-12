const express = require('express');
const router = express.Router();
const upload = require ('../middleware/multer')
const communityController = require('../controllers/communityController');

router.get('/obtener-todas', communityController.getAllCommunities);
router.get('/obtener-miembros/:id', communityController.getCommunityMembers);
router.post('/unirse/:id', communityController.joinCommunity);
router.post('/salir/:id', communityController.leaveCommunity);
router.get('/obtener/:id', communityController.getCommunityById);
router.post('/crear', upload.fields([{name: 'avatar'}, {name: 'banner'}]), communityController.createCommunity);
router.put('/actualizar/:id', communityController.updateCommunity);
router.delete('/eliminar/:id', communityController.deleteCommunity);
router.get('/esMiembro/:idComunidad/:idUsuario', communityController.isMemberOfCommunity)

router.get('/buscar', communityController.searchCommunities);
router.put('/suspender/:id', communityController.suspendCommunity);
router.put('/activar/:id', communityController.activateCommunity);

module.exports = router;