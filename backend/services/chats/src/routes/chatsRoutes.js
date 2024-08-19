const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/messages/:userId1/:userId2', chatController.getMessages);
router.post('/messages', chatController.createMessage);
router.put('/messages/:messageId', chatController.updateMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);

module.exports = router;