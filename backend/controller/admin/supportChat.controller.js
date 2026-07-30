const db = require("../../models");
const helper = require("../../helper/helper");
const { SupportConversation, SupportMessage, User } = db;
const { chatEventEmitter } = require("../user/userSupportChat.controller");

const getConversations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ user_name: { $regex: search, $options: 'i' } }, { user_email: { $regex: search, $options: 'i' } }, { last_message: { $regex: search, $options: 'i' } }];
    if (status && status !== 'all') query.status = status;

    const [rows, count, totalConversations, activeCount, closedCount, unreadCount] = await Promise.all([
      SupportConversation.find(query).populate('user_id', 'id name email').sort({ last_message_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      SupportConversation.countDocuments(query),
      SupportConversation.countDocuments(),
      SupportConversation.countDocuments({ status: 'active' }),
      SupportConversation.countDocuments({ status: 'closed' }),
      SupportConversation.countDocuments({ unread_admin: { $gt: 0 } })
    ]);

    const rowsWithUser = rows.map(c => ({ ...c, user: c.user_id }));
    return helper.success(res, "Fetched support conversations", {
      data: rowsWithUser,
      stats: { totalConversations, activeCount, closedCount, unreadCount },
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { console.error("Error loading conversations:", e); return helper.error(res, "Server error loading conversations", 500); }
};

const getConversationDetails = async (req, res) => {
  try {
    const conversation = await SupportConversation.findById(req.params.id).populate('user_id', 'id name email').lean({ virtuals: true });
    if (!conversation) return helper.error(res, "Conversation not found", 404);

    const messages = await SupportMessage.find({ conversation_id: conversation._id }).sort({ created_at: 1 }).lean({ virtuals: true });

    // Reset admin unread count
    await SupportConversation.findByIdAndUpdate(req.params.id, { unread_admin: 0 });

    return helper.success(res, "Conversation details loaded", { ...conversation, user: conversation.user_id, messages });
  } catch (e) { console.error("Error loading conversation details:", e); return helper.error(res, "Server error loading details", 500); }
};

const sendAdminReply = async (req, res) => {
  try {
    const { conversation_id, message } = req.body;
    const adminUser = req.user;
    if (!conversation_id || !message || !message.trim()) return helper.error(res, "Conversation ID and message are required", 400);

    const conversation = await SupportConversation.findById(conversation_id);
    if (!conversation) return helper.error(res, "Conversation not found", 404);

    const newMessage = await SupportMessage.create({
      conversation_id,
      sender_type: 'admin',
      sender_id: adminUser?._id || null,
      sender_name: adminUser?.name || 'Caflore Support Agent',
      message: message.trim(),
      is_read: false
    });

    conversation.last_message = message.trim();
    conversation.last_message_at = new Date();
    conversation.unread_user = (conversation.unread_user || 0) + 1;
    await conversation.save();

    chatEventEmitter.emit('new_message', { conversation_id, message: newMessage, conversation });
    return helper.success(res, "Admin reply sent successfully", newMessage);
  } catch (e) { console.error("Error sending admin reply:", e); return helper.error(res, "Server error sending admin reply", 500); }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const conversation = await SupportConversation.findById(id);
    if (!conversation) return helper.error(res, "Conversation not found", 404);

    const newStatus = status || (conversation.status === 'active' ? 'closed' : 'active');
    conversation.status = newStatus;
    await conversation.save();

    const sysMsg = await SupportMessage.create({
      conversation_id: id,
      sender_type: 'system',
      sender_name: 'System',
      message: `Conversation status changed to ${newStatus.toUpperCase()}`,
      is_read: true
    });

    chatEventEmitter.emit('new_message', { conversation_id: id, message: sysMsg, conversation });
    return helper.success(res, `Conversation marked as ${newStatus}`, conversation);
  } catch (e) { console.error("Error updating conversation status:", e); return helper.error(res, "Server error updating status", 500); }
};

const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await SupportConversation.findById(id);
    if (!conversation) return helper.error(res, "Conversation not found", 404);
    await SupportMessage.deleteMany({ conversation_id: id });
    await SupportConversation.findByIdAndDelete(id);
    return helper.success(res, "Conversation deleted successfully");
  } catch (e) { console.error("Error deleting conversation:", e); return helper.error(res, "Server error deleting conversation", 500); }
};

module.exports = { getConversations, getConversationDetails, sendAdminReply, updateStatus, deleteConversation };
