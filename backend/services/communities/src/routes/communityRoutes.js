const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.get('/obtener-todas', communityController.getAllCommunities);
router.get('/obtener/:id', communityController.getCommunityById);
router.post('/crear', communityController.createCommunity);
router.put('/actualizar/:id', communityController.updateCommunity);
router.delete('/eliminar/:id', communityController.deleteCommunity);

module.exports = router;