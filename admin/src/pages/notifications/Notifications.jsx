import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FiBell, 
  FiAlertCircle, 
  FiSend, 
  FiCheckCircle, 
  FiClock, 
  FiSearch, 
  FiFilter, 
  FiTrash2, 
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiUser,
  FiX,
  FiChevronDown
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const Notifications = () => {
  // Main state for notifications list and statistics
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    unread: 0,
    push: 0,
    system: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filtering & Search state for History list
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Compose Notification form state
  const [sendTo, setSendTo] = useState('all'); // 'all' | 'specific'
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [notificationType, setNotificationType] = useState('PUSH'); // 'PUSH' | 'SMS' | 'WHATSAPP' | 'SYSTEM'
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    title: '',
    isDeleting: false
  });

  const searchDropdownRef = useRef(null);

  // Fetch Notifications List & Stats
  const fetchNotifications = useCallback(async (page = 1, search = '', type = 'all', target = 'all') => {
    setIsLoading(true);
    try {
      const response = await ApiInstance.get('/notifications', {
        params: {
          page,
          limit: 10,
          search,
          type: type === 'all' ? '' : type.toLowerCase(),
          target: target === 'all' ? '' : target,
        }
      });

      if (response.data?.success) {
        const responseData = response.data.data;
        setNotifications(responseData.data || []);
        if (responseData.stats) {
          setStats(responseData.stats);
        }
        if (responseData.meta) {
          setTotalItems(responseData.meta.totalItems || 0);
          setTotalPages(responseData.meta.totalPages || 1);
          setCurrentPage(responseData.meta.currentPage || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications(currentPage, searchTerm, typeFilter, targetFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchNotifications, currentPage, searchTerm, typeFilter, targetFilter]);

  // Live user search when "Specific User" is chosen
  useEffect(() => {
    if (sendTo !== 'specific' || !userSearchInput.trim()) {
      setUserSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await ApiInstance.get('/users', {
          params: { search: userSearchInput, limit: 5 }
        });
        if (res.data?.success) {
          setUserSearchResults(res.data.data?.data || []);
          setShowUserDropdown(true);
        }
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [userSearchInput, sendTo]);

  // Close user search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Form Submission (Push Notification)
  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Notification title is required');
      return;
    }
    if (!message.trim()) {
      toast.error('Notification message is required');
      return;
    }
    if (sendTo === 'specific' && !selectedUser) {
      toast.error('Please select a specific recipient user');
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type: notificationType.toLowerCase(),
        user_id: sendTo === 'specific' ? (selectedUser?._id || selectedUser?.id) : null,
      };

      const response = await ApiInstance.post('/notifications/push', payload);

      if (response.data?.success) {
        toast.success(`Notification sent successfully via ${notificationType}!`);
        // Reset form
        setTitle('');
        setMessage('');
        if (sendTo === 'specific') {
          setSelectedUser(null);
          setUserSearchInput('');
        }
        // Refresh history
        fetchNotifications(1, searchTerm, typeFilter, targetFilter);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (id, notifTitle) => {
    setDeleteModal({
      isOpen: true,
      id,
      title: notifTitle || 'Notification',
      isDeleting: false
    });
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await ApiInstance.delete(`/notifications/delete/${deleteModal.id}`);
      if (res.data?.success) {
        toast.success('Notification deleted successfully');
        setDeleteModal({ isOpen: false, id: null, title: '', isDeleting: false });
        fetchNotifications(currentPage, searchTerm, typeFilter, targetFilter);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(error.response?.data?.message || 'Failed to delete notification');
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  // Helper for Type Badge Styling
  const getTypeBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'push':
        return 'bg-[#FAF5EF] text-[#5F0917] border-[#E8DACD]';
      case 'sms':
        return 'bg-[#F2E6DA]/40 text-[#7A0C1E] border-[#E8DACD]';
      case 'whatsapp':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'system':
        return 'bg-[#FAF5EF] text-[#A87B39] border-[#E8DACD]';
      default:
        return 'bg-[#FAF5EF] text-[#7A0C1E] border-[#E8DACD]';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
              <FiBell className="w-6 h-6 text-[#7A0C1E]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Notifications & Communication
            </h2>
          </div>
          <p className="text-sm font-semibold text-gray-500 mt-1.5 pl-11">
            Dispatch announcements, system alerts, or targeted messages to your users.
          </p>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Sent</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalSent || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E]">
            <FiBell className="w-5 h-5" />
          </div>
        </div>

        {/* Unread */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Unread</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.unread || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#F2E6DA]/40 text-[#7A0C1E]">
            <FiAlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Push */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Push</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.push || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#5F0917]">
            <FiSend className="w-5 h-5" />
          </div>
        </div>

        {/* System */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">System</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.system || 0}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF5EF] text-[#A87B39]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Compose Notification Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DACD] space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E8DACD]">
              <FiSend className="w-4 h-4 text-[#7A0C1E]" />
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                Compose Notification
              </h3>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-5">
              
              {/* SEND TO Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Send To
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSendTo('all');
                      setSelectedUser(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                      sendTo === 'all'
                        ? 'bg-[#7A0C1E] text-white border-[#7A0C1E] shadow-xs'
                        : 'bg-[#FAF5EF] text-gray-700 border-transparent hover:bg-[#E8DACD]'
                    }`}
                  >
                    <FiUsers className="w-4 h-4" />
                    <span>All Users</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendTo('specific')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                      sendTo === 'specific'
                        ? 'bg-[#7A0C1E] text-white border-[#7A0C1E] shadow-xs'
                        : 'bg-[#FAF5EF] text-gray-700 border-transparent hover:bg-[#E8DACD]'
                    }`}
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Specific User</span>
                  </button>
                </div>

                {/* Specific User Search Input & Suggestion Dropdown */}
                {sendTo === 'specific' && (
                  <div className="relative pt-2" ref={searchDropdownRef}>
                    {selectedUser ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF5EF] border border-[#E8DACD]">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-full bg-[#7A0C1E] text-white flex items-center justify-center font-black text-xs shrink-0">
                            {selectedUser.name?.charAt(0) || 'U'}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-black text-gray-900 truncate">{selectedUser.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{selectedUser.email}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(null)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all cursor-pointer shrink-0"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search user by name, email or phone..."
                            value={userSearchInput}
                            onChange={(e) => setUserSearchInput(e.target.value)}
                            onFocus={() => {
                              if (userSearchResults.length > 0) setShowUserDropdown(true);
                            }}
                            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                          />
                          {isSearchingUsers && (
                            <FiLoader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A0C1E] animate-spin" />
                          )}
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {showUserDropdown && userSearchResults.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E8DACD] z-30 max-h-48 overflow-y-auto divide-y divide-[#E8DACD]/50">
                            {userSearchResults.map((usr) => (
                              <button
                                key={usr.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUser(usr);
                                  setShowUserDropdown(false);
                                  setUserSearchInput('');
                                }}
                                className="w-full text-left p-3 hover:bg-[#FAF5EF] transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <div>
                                  <p className="text-xs font-extrabold text-gray-900">{usr.name || 'Unnamed'}</p>
                                  <p className="text-[11px] text-gray-400">{usr.email}</p>
                                </div>
                                <span className="text-[10px] font-bold text-[#7A0C1E] uppercase bg-[#FAF5EF] px-2 py-0.5 rounded-full border border-[#E8DACD]">
                                  {usr.role || 'User'}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* NOTIFICATION TYPE Selection Pills */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Notification Type
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['PUSH', 'SMS', 'WHATSAPP', 'SYSTEM'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNotificationType(type)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer text-center border ${
                        notificationType === type
                          ? 'bg-[#7A0C1E] text-white border-[#7A0C1E] shadow-2xs scale-[1.02]'
                          : 'bg-[#FAF5EF] text-gray-700 border-transparent hover:bg-[#E8DACD]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* TITLE Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all"
                />
              </div>

              {/* MESSAGE Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  rows="4"
                  placeholder="Write your notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EF] text-xs font-semibold text-gray-800 border border-[#E8DACD]/80 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] transition-all resize-none"
                />
              </div>

              {/* Submit Send Notification Button */}
              <button
                type="submit"
                disabled={isSending}
                className="bg-[#7A0C1E] hover:bg-[#5F0917] text-white w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {isSending ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    <span>Sending Notification...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    <span>Send Notification</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Notification History List */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8DACD] space-y-5 flex flex-col h-full justify-between">
            
            <div className="space-y-4">
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DACD]">
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-[#7A0C1E]" />
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    Notification History ({totalItems})
                  </h3>
                </div>

                {/* Filter Controls Row */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-44">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF5EF] text-xs font-semibold text-gray-700 border border-[#E8DACD] focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF5EF] text-xs font-bold text-gray-700 border border-[#E8DACD] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="push">PUSH</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WHATSAPP</option>
                    <option value="system">SYSTEM</option>
                  </select>

                  {/* Target Filter */}
                  <select
                    value={targetFilter}
                    onChange={(e) => {
                      setTargetFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF5EF] text-xs font-bold text-gray-700 border border-[#E8DACD] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Targets</option>
                    <option value="all_users">Broadcast (All)</option>
                    <option value="specific">Specific User</option>
                  </select>
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto relative min-h-[360px]">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
                    <div className="flex items-center gap-2 font-black text-[#7A0C1E] text-xs">
                      <FiLoader className="w-5 h-5 animate-spin" />
                      <span>Loading History...</span>
                    </div>
                  </div>
                )}

                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5EF] text-[#7A0C1E] font-extrabold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">Title</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DACD]/50 font-medium text-gray-700">
                    {!isLoading && notifications.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-400 font-bold">
                          No notifications history found.
                        </td>
                      </tr>
                    ) : (
                      notifications.map((item) => {
                        const isBroadcast = !item.user_id;
                        const isRead = item.is_read;

                        return (
                          <tr key={item.id} className="hover:bg-[#FAF5EF]/40 transition-colors">
                            {/* Title & Message Snippet */}
                            <td className="py-3.5 px-4 max-w-[200px]">
                              <div className="font-extrabold text-gray-900 truncate">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-gray-400 truncate">
                                {item.message}
                              </div>
                            </td>

                            {/* Recipient */}
                            <td className="py-3.5 px-4">
                              {isBroadcast ? (
                                <div>
                                  <span className="text-xs font-bold text-gray-800">All Users</span>
                                  <div className="text-[10px] text-gray-400 font-semibold uppercase">Broadcast</div>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-xs font-bold text-gray-800">
                                    {item.user?.name || `User #${item.user_id}`}
                                  </span>
                                  <span className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#FAF5EF] text-[#7A0C1E]">
                                    {item.user?.role || 'Customer'}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Type Pill */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${getTypeBadgeStyle(item.type)}`}>
                                {item.type || 'PUSH'}
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4">
                              {isRead ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FAF5EF] text-[#5F0917]">
                                  Read
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#F2E6DA]/40 text-[#7A0C1E]">
                                  Unread
                                </span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="py-3.5 px-4 text-gray-400 text-[11px] font-semibold whitespace-nowrap">
                              {formatDate(item.createdAt || item.created_at)}
                            </td>

                            {/* Action Trash Icon */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => openDeleteModal(item.id, item.title)}
                                title="Delete Notification"
                                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="pt-3 border-t border-[#E8DACD] flex items-center justify-between text-xs font-bold text-gray-600">
                <span>
                  Showing page {currentPage} of {totalPages} ({totalItems} items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-xl bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD] disabled:opacity-40 hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 py-1 rounded-lg bg-[#7A0C1E] text-white font-black">
                    {currentPage}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-xl bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD] disabled:opacity-40 hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, title: '', isDeleting: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModal.isDeleting}
        title="Delete Notification"
        message={`Are you sure you want to delete notification "${deleteModal.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Notifications;