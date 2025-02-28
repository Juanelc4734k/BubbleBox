const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const groupChatController = require('../controllers/groupChatController');

router.get('/messages/:userId1/:userId2', chatController.getMessages);
router.post('/messages', chatController.createMessage);
router.put('/messages/:messageId', chatController.updateMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);

router.post('/groups', groupChatController.createGroup);
router.post('/groups/members', groupChatController.addMember);
router.get('/groups/user/:userId', groupChatController.getGroups);
router.get('/groups/:groupId/messages', groupChatController.getGroupMessages);
router.post('/groups/:groupId/users', groupChatController.getGroupUsers);

module.exports = router;