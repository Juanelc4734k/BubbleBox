const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const groupChatController = require('../controllers/groupChatController');
const upload = require('../middleware/multer');

router.get('/messages/:userId1/:userId2', chatController.getMessages);
router.post('/messages', chatController.createMessage);

router.post('/file-message', upload.single('file'), chatController.createFileMessage);

router.put('/messages/:messageId', chatController.updateMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);
router.get('/unread/:userId/:friendId', chatController.getUnreadCount);
// Add this route
router.put('/markAsRead/:userId/:friendId', chatController.markMessagesAsRead);

router.post('/audio-message', upload.single('audio'), chatController.createAudioMessage);

router.put('/update-last-seen/:userId', chatController.updateLastSeen);

router.post('/groups', upload.single('imagen'), groupChatController.createGroup);
router.post('/groups/members', groupChatController.addMember);
router.get('/groups/user/:userId', groupChatController.getGroups);
router.get('/groups/:groupId', groupChatController.getGroup);
router.get('/groups/:groupId/users', groupChatController.getGroupUsers);


router.get('/groups/:groupId/messages/:userId', groupChatController.getGroupMessages);
router.post('/groups/:groupId/messages', groupChatController.createGroupMessage);

module.exports = router;