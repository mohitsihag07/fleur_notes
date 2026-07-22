const { Op } = require("sequelize");
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
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { user_name: { [Op.like]: `%${search}%` } },
        { user_email: { [Op.like]: `%${search}%` } },
        { last_message: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows } = await SupportConversation.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      limit,
      offset,
      order: [['last_message_at', 'DESC']]
    });

    // Stats
    const totalConversations = await SupportConversation.count();
    const activeCount = await SupportConversation.count({ where: { status: 'active' } });
    const closedCount = await SupportConversation.count({ where: { status: 'closed' } });
    const unreadCount = await SupportConversation.count({ where: { unread_admin: { [Op.gt]: 0 } } });

    return helper.success(res, "Fetched support conversations", {
      data: rows,
      stats: {
        totalConversations,
        activeCount,
        closedCount,
        unreadCount
      },
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Error loading conversations:", error);
    return helper.error(res, "Server error loading conversations", 500);
  }
};

const getConversationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await SupportConversation.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: SupportMessage, as: 'messages', required: false }
      ],
      order: [[{ model: SupportMessage, as: 'messages' }, 'created_at', 'ASC']]
    });

    if (!conversation) {
      return helper.error(res, "Conversation not found", 404);
    }

    // Reset admin unread count
    await conversation.update({ unread_admin: 0 });

    return helper.success(res, "Conversation details loaded", conversation);
  } catch (error) {
    console.error("Error loading conversation details:", error);
    return helper.error(res, "Server error loading details", 500);
  }
};

const sendAdminReply = async (req, res) => {
  try {
    const { conversation_id, message } = req.body;
    const adminUser = req.user;

    if (!conversation_id || !message || !message.trim()) {
      return helper.error(res, "Conversation ID and message are required", 400);
    }

    const conversation = await SupportConversation.findByPk(conversation_id);
    if (!conversation) {
      return helper.error(res, "Conversation not found", 404);
    }

    const adminName = adminUser?.name || "Fleur Support Agent";

    const newMessage = await SupportMessage.create({
      conversation_id,
      sender_type: 'admin',
      sender_id: adminUser?.id || null,
      sender_name: adminName,
      message: message.trim(),
      is_read: false
    });

    await conversation.update({
      last_message: message.trim(),
      last_message_at: new Date(),
      unread_user: conversation.unread_user + 1
    });

    // Emit real-time event
    chatEventEmitter.emit('new_message', {
      conversation_id,
      message: newMessage,
      conversation
    });

    return helper.success(res, "Admin reply sent successfully", newMessage);
  } catch (error) {
    console.error("Error sending admin reply:", error);
    return helper.error(res, "Server error sending admin reply", 500);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const conversation = await SupportConversation.findByPk(id);
    if (!conversation) {
      return helper.error(res, "Conversation not found", 404);
    }

    const newStatus = status || (conversation.status === 'active' ? 'closed' : 'active');
    await conversation.update({ status: newStatus });

    // Send system message
    const sysMsg = await SupportMessage.create({
      conversation_id: id,
      sender_type: 'system',
      sender_name: 'System',
      message: `Conversation status changed to ${newStatus.toUpperCase()}`,
      is_read: true
    });

    chatEventEmitter.emit('new_message', {
      conversation_id: id,
      message: sysMsg,
      conversation
    });

    return helper.success(res, `Conversation marked as ${newStatus}`, conversation);
  } catch (error) {
    console.error("Error updating conversation status:", error);
    return helper.error(res, "Server error updating status", 500);
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await SupportConversation.findByPk(id);
    if (!conversation) {
      return helper.error(res, "Conversation not found", 404);
    }

    await SupportMessage.destroy({ where: { conversation_id: id } });
    await conversation.destroy();

    return helper.success(res, "Conversation deleted successfully");
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return helper.error(res, "Server error deleting conversation", 500);
  }
};

module.exports = {
  getConversations,
  getConversationDetails,
  sendAdminReply,
  updateStatus,
  deleteConversation
};
