import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiSend,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiLoader,
  FiUser,
  FiXCircle,
  FiAlertCircle,
  FiCheck,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const LiveSupportChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeCount: 0,
    closedCount: 0,
    unreadCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete Modal
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    conversationId: null,
    customerName: '',
    isDeleting: false
  });

  const chatEndRef = useRef(null);

  // Fetch all conversations from backend
  const fetchConversations = useCallback(async (search = '', status = 'all') => {
    try {
      const response = await ApiInstance.get('/support-chat/conversations', {
        params: { limit: 50, search, status }
      });

      if (response.data?.success) {
        const payload = response.data.data;
        setConversations(payload.data || []);
        if (payload.stats) {
          setStats(payload.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch & search filter listener
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations(searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchConversations, searchTerm, statusFilter]);

  // Periodic 3-second live sync poll for instant updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(searchTerm, statusFilter);
      if (selectedConversation?.id) {
        fetchConversationMessages(selectedConversation.id, false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchConversations, searchTerm, statusFilter, selectedConversation?.id]);

  // Fetch full messages for selected conversation
  const fetchConversationMessages = async (id, showLoader = true) => {
    if (showLoader) setIsMessagesLoading(true);
    try {
      const response = await ApiInstance.get(`/support-chat/conversations/${id}`);
      if (response.data?.success) {
        const convDetails = response.data.data;
        setMessages(convDetails.messages || []);
        setSelectedConversation(convDetails);
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      toast.error('Failed to load chat messages');
    } finally {
      if (showLoader) setIsMessagesLoading(false);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle selecting a conversation
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchConversationMessages(conv.id, true);
  };

  // Send admin reply
  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!selectedConversation || !replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await ApiInstance.post('/support-chat/send-reply', {
        conversation_id: selectedConversation.id,
        message: replyText.trim()
      });

      if (response.data?.success) {
        const newMsg = response.data.data;
        setMessages((prev) => [...prev, newMsg]);
        setReplyText('');
        fetchConversations(searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  // Toggle conversation status (active / closed)
  const handleToggleStatus = async (convId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      const response = await ApiInstance.put(`/support-chat/status/${convId}`, { status: newStatus });
      if (response.data?.success) {
        toast.success(`Conversation marked as ${newStatus.toUpperCase()}`);
        fetchConversations(searchTerm, statusFilter);
        if (selectedConversation?.id === convId) {
          setSelectedConversation((prev) => prev ? { ...prev, status: newStatus } : null);
          fetchConversationMessages(convId, false);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update conversation status');
    }
  };

  // Confirm delete conversation
  const handleConfirmDelete = async () => {
    const { conversationId } = deleteModalState;
    if (!conversationId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await ApiInstance.delete(`/support-chat/delete/${conversationId}`);
      if (response.data?.success) {
        toast.success('Conversation deleted successfully');
        setDeleteModalState({ isOpen: false, conversationId: null, customerName: '', isDeleting: false });
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }
        fetchConversations(searchTerm, statusFilter);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Date formatting helper
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD]">
              <FiMessageSquare className="w-6 h-6 text-[#7A0C1E]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Live Customer Support Chat
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Real-time live messaging module with active store customers.
          </p>
        </div>

        <button
          onClick={() => fetchConversations(searchTerm, statusFilter)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E8DACD] hover:bg-[#FAF5EF] text-gray-700 font-bold text-xs shadow-2xs transition-all cursor-pointer w-fit"
        >
          <FiRefreshCw className={`w-4 h-4 text-[#7A0C1E] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Chats</span>
        </button>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Conversations */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Chats</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalConversations}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
            <FiMessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Active Chats */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Chats</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activeCount}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#5F0917]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Unread Admin Messages */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Unread Messages</p>
            <h3 className="text-2xl font-black text-[#7A0C1E] mt-1">{stats.unreadCount}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#F2E6DA]/40 text-[#7A0C1E]">
            <FiAlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Closed Chats */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Closed Chats</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.closedCount}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-gray-100 text-gray-600">
            <FiXCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Chat Grid Console */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8DACD] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] h-[70vh]">
        {/* Left Column: Customer Conversations List (4 cols) */}
        <div className="lg:col-span-4 border-r border-[#E8DACD] flex flex-col h-full bg-[#FAF5EF]/30">
          {/* List Search & Filter Bar */}
          <div className="p-4 border-b border-[#E8DACD] space-y-3 bg-white">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#FAF5EF] text-xs font-semibold text-gray-700 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#FAF5EF] p-1 rounded-full text-xs font-bold border border-[#E8DACD]">
              {['all', 'active', 'closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1 rounded-full text-[11px] font-black capitalize transition-all cursor-pointer ${statusFilter === st
                      ? 'bg-[#7A0C1E] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E8DACD]/60">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400 font-bold text-xs flex items-center justify-center gap-2">
                <FiLoader className="w-4 h-4 animate-spin text-[#7A0C1E]" />
                <span>Loading chat list...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold text-xs space-y-2">
                <FiMessageSquare className="w-8 h-8 mx-auto text-gray-300" />
                <p>No customer chats found.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const hasUnread = conv.unread_admin > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 transition-colors cursor-pointer flex items-start gap-3 relative ${isSelected
                        ? 'bg-[#FAF5EF] border-l-4 border-l-[#7A0C1E]'
                        : 'hover:bg-white'
                      }`}
                  >
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-2xl bg-[#7A0C1E] text-white flex items-center justify-center font-black shrink-0 border border-[#E8DACD]">
                      {conv.user_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-black text-gray-900 truncate">
                          {conv.user_name}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-500 truncate font-medium">
                        {conv.last_message || 'Started new chat...'}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${conv.status === 'active'
                            ? 'bg-[#FAF5EF] text-[#5F0917]'
                            : 'bg-gray-200 text-gray-600'
                          }`}>
                          {conv.status}
                        </span>

                        {hasUnread && (
                          <span className="px-2 py-0.5 rounded-full bg-[#7A0C1E] text-white font-black text-[9px] animate-pulse">
                            {conv.unread_admin} NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window Pane (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white">
          {!selectedConversation ? (
            /* No Conversation Selected Placeholder */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3 bg-[#FAF5EF]/20">
              <div className="w-16 h-16 rounded-full bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD] flex items-center justify-center shadow-xs">
                <FiMessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-gray-800 tracking-tight">
                Select a Customer Conversation
              </h3>
              <p className="text-xs text-gray-500 max-w-sm font-semibold">
                Click on any customer in the left pane to view message history and send live support replies.
              </p>
            </div>
          ) : (
            /* Active Live Chat Thread View */
            <>
              {/* Chat Thread Header */}
              <div className="p-4 border-b border-[#E8DACD] bg-[#FAF5EF]/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#7A0C1E] text-white flex items-center justify-center font-black text-sm">
                    {selectedConversation.user_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                      {selectedConversation.user_name}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-semibold">
                      {selectedConversation.user_email || 'No email registered'} • Chat ID #{selectedConversation.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Status Button */}
                  <button
                    onClick={() => handleToggleStatus(selectedConversation.id, selectedConversation.status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${selectedConversation.status === 'active'
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                  >
                    {selectedConversation.status === 'active' ? (
                      <>
                        <FiXCircle className="w-3.5 h-3.5" />
                        <span>Close Chat</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        <span>Reopen Chat</span>
                      </>
                    )}
                  </button>

                  {/* Delete Conversation Button */}
                  <button
                    onClick={() => setDeleteModalState({
                      isOpen: true,
                      conversationId: selectedConversation.id,
                      customerName: selectedConversation.user_name,
                      isDeleting: false
                    })}
                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    title="Delete Chat Thread"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAF5EF]/10">
                {isMessagesLoading ? (
                  <div className="py-12 text-center text-gray-400 font-bold text-xs flex items-center justify-center gap-2">
                    <FiLoader className="w-5 h-5 animate-spin text-[#7A0C1E]" />
                    <span>Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 font-bold text-xs">
                    No messages yet in this chat.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.sender_type === 'admin';
                    const isSystem = msg.sender_type === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="px-3 py-1 bg-[#FAF5EF] text-[#7A0C1E] text-[10px] font-bold rounded-full border border-[#E8DACD]">
                            {msg.message}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-[#7A0C1E]/20 text-[#7A0C1E] flex items-center justify-center font-black text-[10px] shrink-0 border border-[#E8DACD]">
                            {msg.sender_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}

                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${isAdmin
                              ? 'bg-[#7A0C1E] text-white rounded-tr-none'
                              : 'bg-white border border-[#E8DACD] text-gray-900 rounded-tl-none'
                            }`}
                        >
                          <div className="font-extrabold text-[10px] opacity-80 mb-0.5">
                            {isAdmin ? 'CafloreSupport Agent' : msg.sender_name}
                          </div>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <span className={`block text-[9px] text-right mt-1 font-semibold ${isAdmin ? 'text-white/70' : 'text-gray-400'
                            }`}>
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Reply Templates */}
              <div className="px-4 py-2 bg-gray-50 border-t border-[#E8DACD] flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">Quick Replies:</span>
                {[
                  'Hello! How can I assist you today?',
                  'Let me check your order details right away.',
                  'Your request has been processed successfully! 🌸',
                  'Thank you for reaching out to Caflore Support!'
                ].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setReplyText(tmpl)}
                    className="shrink-0 px-3 py-1 rounded-full bg-white border border-[#E8DACD] hover:border-[#7A0C1E] hover:text-[#7A0C1E] text-[10px] font-extrabold text-gray-700 transition-all cursor-pointer"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              {/* Chat Reply Input Bar */}
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-[#E8DACD] flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type your live support response here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                />

                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7A0C1E] hover:bg-[#5F0917] disabled:opacity-40 text-white font-black text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  {isSending ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSend className="w-4 h-4" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Confirm Delete Conversation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, conversationId: null, customerName: '', isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.isDeleting}
        title="Delete Customer Chat"
        message={`Are you sure you want to delete chat thread for customer "${deleteModalState.customerName}"? All message history will be deleted.`}
        confirmText="Delete Chat"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default LiveSupportChat;
