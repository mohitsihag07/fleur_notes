const express = require('express');
const router = express.Router();
const supportChatController = require('../../controller/admin/supportChat.controller');
const { authenticateAdmin } = require('../../middleware/auth');

router.use(authenticateAdmin);

router.get('/conversations', supportChatController.getConversations);
router.get('/conversations/:id', supportChatController.getConversationDetails);
router.post('/send-reply', supportChatController.sendAdminReply);
router.put('/status/:id', supportChatController.updateStatus);
router.delete('/delete/:id', supportChatController.deleteConversation);

module.exports = router;
