const db = require("../../models");
const helper = require("../../helper/helper");
const { SupportConversation, SupportMessage } = db;
const { EventEmitter } = require("events");

// Global Event Emitter for real-time live chat streams
const chatEventEmitter = new EventEmitter();
chatEventEmitter.setMaxListeners(200);

const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user?._id || null;
    const userName = req.body?.user_name || req.user?.name || "Guest Customer";
    const userEmail = req.body?.user_email || req.user?.email || null;

    let conversation = null;
    if (userId) {
      conversation = await SupportConversation.findOne({ user_id: userId, status: 'active' }).sort({ _id: -1 }).lean({ virtuals: true });
    }

    if (!conversation) {
      conversation = await SupportConversation.create({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        status: 'active',
        unread_admin: 1,
        unread_user: 0,
        last_message: 'Welcome to Fleur Notes Support! How can we assist you today?',
        last_message_at: new Date()
      });

      await SupportMessage.create({
        conversation_id: conversation._id,
        sender_type: 'admin',
        sender_id: null,
        sender_name: 'Fleur Notes Support Agent',
        message: `Hello ${userName}! Welcome to Fleur Notes Support. 🌸 How can we assist you with your orders, returns, or gifts today?`,
        is_read: true
      });
    }

    return helper.success(res, "Conversation loaded successfully", conversation);
  } catch (e) { console.error("Error in getOrCreateConversation:", e); return helper.error(res, "Server error getting conversation", 500); }
};

const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    if (!conversation_id) return helper.error(res, "Conversation ID is required", 400);

    const messages = await SupportMessage.find({ conversation_id }).sort({ created_at: 1 }).lean({ virtuals: true });

    // Reset unread_user count
    await SupportConversation.findByIdAndUpdate(conversation_id, { unread_user: 0 });

    return helper.success(res, "Messages retrieved successfully", messages);
  } catch (e) { console.error("Error fetching chat messages:", e); return helper.error(res, "Server error fetching messages", 500); }
};

const sendMessage = async (req, res) => {
  try {
    const { conversation_id, message, user_name } = req.body;
    const userId = req.user?._id || null;
    if (!conversation_id || !message || !message.trim()) return helper.error(res, "Conversation ID and message are required", 400);

    const conversation = await SupportConversation.findById(conversation_id);
    if (!conversation) return helper.error(res, "Conversation not found", 404);

    const senderName = user_name || req.user?.name || conversation.user_name || "Customer";
    const newMessage = await SupportMessage.create({
      conversation_id,
      sender_type: 'user',
      sender_id: userId,
      sender_name: senderName,
      message: message.trim(),
      is_read: false
    });

    conversation.last_message = message.trim();
    conversation.last_message_at = new Date();
    conversation.unread_admin = (conversation.unread_admin || 0) + 1;
    conversation.status = 'active';
    await conversation.save();

    chatEventEmitter.emit('new_message', { conversation_id, message: newMessage, conversation });
    return helper.success(res, "Message sent successfully", newMessage);
  } catch (e) { console.error("Error sending user message:", e); return helper.error(res, "Server error sending message", 500); }
};

const streamEvents = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const conversationId = req.query.conversation_id;
  const onMessage = (data) => {
    if (!conversationId || String(data.conversation_id) === String(conversationId)) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  chatEventEmitter.on('new_message', onMessage);
  req.on('close', () => { chatEventEmitter.off('new_message', onMessage); });
};

module.exports = { getOrCreateConversation, getMessages, sendMessage, streamEvents, chatEventEmitter };
