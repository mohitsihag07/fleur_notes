const express = require('express');
const router = express.Router();
const userSupportChatController = require('../../controller/user/userSupportChat.controller');

router.post('/init', userSupportChatController.getOrCreateConversation);
router.get('/messages/:conversation_id', userSupportChatController.getMessages);
router.post('/send', userSupportChatController.sendMessage);
router.get('/stream', userSupportChatController.streamEvents);

module.exports = router;
