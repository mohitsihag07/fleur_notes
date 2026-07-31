import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import ConfirmModal from '../components/ConfirmModal';
import ApiInstance, { getBackendURL } from '../utils/ApiInstance';
import {
  FiAlignLeft,
  FiSearch,
  FiMessageSquare,
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiExternalLink,
  FiUser,
  FiSettings,
  FiShield,
  FiBox,
  FiImage,
  FiUsers,
  FiShoppingBag,
  FiTag,
  FiFileText,
  FiX,
  FiLoader,
  FiGrid,
  FiHelpCircle,
  FiStar,
  FiCreditCard,
  FiNavigation
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';

const ALL_NAVIGATION_PAGES = [
  { name: 'Dashboard Overview', path: '/dashboard', icon: FiGrid, category: 'Page Navigation' },
  { name: 'Banners Management', path: '/banners', icon: FiImage, category: 'Page Navigation' },
  { name: 'Users Management', path: '/users', icon: FiUsers, category: 'Page Navigation' },
  { name: 'Categories Management', path: '/categories', icon: FiBox, category: 'Page Navigation' },
  { name: 'Products Catalog', path: '/products', icon: FiShoppingBag, category: 'Page Navigation' },
  { name: 'Orders List', path: '/orders', icon: FiFileText, category: 'Page Navigation' },
  { name: 'Coupons & Discounts', path: '/coupons', icon: FiTag, category: 'Page Navigation' },
  { name: 'Payments & Transactions', path: '/payment', icon: FiCreditCard, category: 'Page Navigation' },
  { name: 'Notifications Center', path: '/notifications', icon: FiBell, category: 'Page Navigation' },
  { name: 'Customer Reviews', path: '/reviews', icon: FiStar, category: 'Page Navigation' },
  { name: 'FAQs Management', path: '/faqs', icon: FiHelpCircle, category: 'Page Navigation' },
  { name: 'CMS Pages', path: '/cms', icon: FiFileText, category: 'Page Navigation' },
  { name: 'Contact Support', path: '/contact-support', icon: FiMessageSquare, category: 'Page Navigation' },
  { name: 'Admin Profile', path: '/profile', icon: FiUser, category: 'Page Navigation' },
  { name: 'System Settings', path: '/settings', icon: FiSettings, category: 'Page Navigation' },
];

const Navbar = () => {
  const { user, logout, isSidebarOpen, toggleSidebar } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Popover & Dropdown States
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showMsgPopover, setShowMsgPopover] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Global Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({
    pages: [],
    products: [],
    users: [],
    orders: [],
    categories: []
  });

  // Live Data States
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  const [messages, setMessages] = useState([]);
  const [msgCount, setMsgCount] = useState(0);

  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch Navbar Notifications & Live Support Chat Conversations from Backend
  const fetchNavbarData = async () => {
    try {
      const notifRes = await ApiInstance.get('/notifications', { params: { page: 1, limit: 5 } });
      if (notifRes.data?.success) {
        const list = notifRes.data.data?.data || [];
        setNotifications(list);
        setNotifCount(notifRes.data.data?.pagination?.totalItems || list.length);
      }

      const msgRes = await ApiInstance.get('/support-chat/conversations', { params: { page: 1, limit: 5 } });
      if (msgRes.data?.success) {
        const payload = msgRes.data.data;
        const list = payload?.data || [];
        setMessages(list);
        const unreadTotal = payload?.stats?.unreadCount ?? list.filter(m => (m.unread_admin || 0) > 0).length;
        setMsgCount(unreadTotal);
      }
    } catch (error) {
      console.error('Error fetching navbar popover data:', error);
    }
  };

  useEffect(() => {
    fetchNavbarData();
    const interval = setInterval(fetchNavbarData, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Global Search Handler (Debounced)
  useEffect(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      setSearchResults({ pages: [], products: [], users: [], orders: [], categories: [] });
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);

    const timer = setTimeout(async () => {
      try {
        // 1. Filter matching quick navigation pages
        const matchingPages = ALL_NAVIGATION_PAGES.filter(p =>
          p.name.toLowerCase().includes(trimmed) || p.path.toLowerCase().includes(trimmed)
        );

        // 2. Fetch matching entities from backend APIs
        const [prodRes, userRes, orderRes, catRes] = await Promise.allSettled([
          ApiInstance.get('/products', { params: { search: trimmed, page: 1, limit: 4 } }),
          ApiInstance.get('/users', { params: { search: trimmed, page: 1, limit: 4 } }),
          ApiInstance.get('/orders', { params: { search: trimmed, page: 1, limit: 4 } }),
          ApiInstance.get('/categories', { params: { search: trimmed, page: 1, limit: 4 } })
        ]);

        const products = prodRes.status === 'fulfilled' && prodRes.value?.data?.success ? (prodRes.value.data.data?.data || prodRes.value.data.data || []) : [];
        const users = userRes.status === 'fulfilled' && userRes.value?.data?.success ? (userRes.value.data.data?.data || userRes.value.data.data || []) : [];
        const orders = orderRes.status === 'fulfilled' && orderRes.value?.data?.success ? (orderRes.value.data.data?.data || orderRes.value.data.data || []) : [];
        const categories = catRes.status === 'fulfilled' && catRes.value?.data?.success ? (catRes.value.data.data?.data || catRes.value.data.data || []) : [];

        setSearchResults({
          pages: matchingPages,
          products: Array.isArray(products) ? products.slice(0, 4) : [],
          users: Array.isArray(users) ? users.slice(0, 4) : [],
          orders: Array.isArray(orders) ? orders.slice(0, 4) : [],
          categories: Array.isArray(categories) ? categories.slice(0, 4) : []
        });
      } catch (error) {
        console.error('Global search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifPopover(false);
      }
      if (msgRef.current && !msgRef.current.contains(event.target)) {
        setShowMsgPopover(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic Page Title Mapper
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/support/chat')) return 'Live Support Chat';
    if (path.includes('/contact-support')) return 'Contact Support';
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/banners')) return 'Banners & Promotions';
    if (path.includes('/categories')) return 'Categories';
    if (path.includes('/products')) return 'Products Catalog';
    if (path.includes('/orders')) return 'Orders';
    if (path.includes('/coupons')) return 'Coupons & Discounts';
    if (path.includes('/payment') || path.includes('/payments')) return 'Payments & Transactions';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/reviews')) return 'Reviews';
    if (path.includes('/faqs')) return 'FAQs';
    if (path.includes('/cms')) return 'CMS Pages';
    if (path.includes('/users')) return 'Users Management';
    if (path.includes('/profile')) return 'Admin Profile';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/reported-users')) return 'Reported Users';
    return 'Dashboard';
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleResultClick = (targetPath) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(targetPath);
  };

  const hasAnyResults =
    searchResults.pages.length > 0 ||
    searchResults.products.length > 0 ||
    searchResults.users.length > 0 ||
    searchResults.orders.length > 0 ||
    searchResults.categories.length > 0;

  return (
    <>
      <header className="pt-3 sm:pt-6 px-3 sm:px-8 bg-[#FAF5EF] transition-all duration-300 shrink-0">
        {/* Floating Card Navbar Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl px-3.5 sm:px-6 py-2.5 sm:py-3.5 shadow-sm border border-[#E8DACD] flex items-center justify-between gap-2">

          {/* Left section: Hamburger Toggle */}
          <div className="flex items-center gap-5">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-2xl bg-[#FAF5EF] text-[#7A0C1E] flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm transition-all cursor-pointer"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <FiAlignLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Center Global Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                {isSearching ? (
                  <FiLoader className="h-4 w-4 text-[#7A0C1E] animate-spin" />
                ) : (
                  <FiSearch className="h-4 w-4 text-gray-400" />
                )}
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSearchDropdown(true);
                }}
                placeholder="Search products, users, orders, categories..."
                className="w-full bg-[#FAF5EF] text-gray-800 border border-[#E8DACD]/80 rounded-full pl-11 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A0C1E] hover:bg-[#F2E6DA]/60 transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Global Search Results Dropdown Popover */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-[#E8DACD] z-50 overflow-hidden animate-fadeIn max-h-[460px] overflow-y-auto">
                {isSearching ? (
                  <div className="p-6 text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-2">
                    <FiLoader className="w-4 h-4 text-[#7A0C1E] animate-spin" />
                    <span>Searching records...</span>
                  </div>
                ) : !hasAnyResults ? (
                  <div className="p-6 text-center text-xs font-bold text-gray-400">
                    No results found for "<span className="text-gray-700">{searchQuery}</span>". Try another search term.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E8DACD]">

                    {/* Quick Pages Navigation */}
                    {searchResults.pages.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-3 mb-1">
                          Quick Navigation
                        </div>
                        {searchResults.pages.map((p) => {
                          const IconComp = p.icon;
                          return (
                            <div
                              key={p.path}
                              onClick={() => handleResultClick(p.path)}
                              className="px-3 py-2 rounded-2xl hover:bg-[#F2E6DA] flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <IconComp className="w-4 h-4 text-[#7A0C1E]" />
                                <span className="text-xs font-black text-gray-800">{p.name}</span>
                              </div>
                              <FiNavigation className="w-3.5 h-3.5 text-gray-300" />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Products Search Results */}
                    {searchResults.products.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-3 mb-1">
                          Products ({searchResults.products.length})
                        </div>
                        {searchResults.products.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => handleResultClick(`/products/${prod.id}`)}
                            className="px-3 py-2 rounded-2xl hover:bg-[#F2E6DA] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-[#7A0C1E]">
                                <FiShoppingBag className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800 line-clamp-1">{prod.title || prod.name}</p>
                                <p className="text-[10px] font-bold text-[#7A0C1E]">₹{prod.selling_price || prod.price || '0'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">View Product</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Users Search Results */}
                    {searchResults.users.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-3 mb-1">
                          Users / Customers ({searchResults.users.length})
                        </div>
                        {searchResults.users.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => handleResultClick(`/users/${u.id}`)}
                            className="px-3 py-2 rounded-2xl hover:bg-[#F2E6DA] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-[#FAF5EF] text-[#2B1B17] font-black text-xs flex items-center justify-center shrink-0">
                                {u.name ? u.name[0].toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800">{u.name}</p>
                                <p className="text-[10px] font-semibold text-gray-500">{u.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">View User</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Orders Search Results */}
                    {searchResults.orders.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-3 mb-1">
                          Orders ({searchResults.orders.length})
                        </div>
                        {searchResults.orders.map((ord) => (
                          <div
                            key={ord.id}
                            onClick={() => handleResultClick(`/orders/${ord.id}`)}
                            className="px-3 py-2 rounded-2xl hover:bg-[#F2E6DA] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-[#7A0C1E]/20 text-[#D94545] flex items-center justify-center shrink-0">
                                <FiFileText className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800">Order #{ord.order_number || ord.id}</p>
                                <p className="text-[10px] font-bold text-[#7A0C1E]">₹{ord.total_amount || ord.grand_total || '0'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">View Order</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Categories Search Results */}
                    {searchResults.categories.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-3 mb-1">
                          Categories ({searchResults.categories.length})
                        </div>
                        {searchResults.categories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => handleResultClick(`/categories/${cat.id}`)}
                            className="px-3 py-2 rounded-2xl hover:bg-[#F2E6DA] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                                <FiBox className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800">{cat.name || cat.title}</p>
                                <p className="text-[10px] font-semibold text-gray-400">{cat.slug ? `/${cat.slug}` : ''}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">View Category</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-4">

            {/* 1. Live Support Chat Messages Popover Icon */}
            <div className="relative" ref={msgRef}>
              <button
                onClick={() => {
                  setShowMsgPopover(!showMsgPopover);
                  setShowNotifPopover(false);
                  setShowProfileDropdown(false);
                }}
                className={`relative p-2.5 rounded-full transition-all cursor-pointer ${showMsgPopover ? 'bg-[#7A0C1E] text-white' : 'bg-[#FAF5EF] text-[#7A0C1E] hover:bg-[#F2E6DA] hover:text-[#5F0917]'
                  }`}
                title="Support Messages"
              >
                <FiMessageSquare className="w-5 h-5" />
                {msgCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#7A0C1E] text-white font-black text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {msgCount > 99 ? '99+' : msgCount}
                  </span>
                )}
              </button>

              {/* Messages Floating Dropdown Popover */}
              {showMsgPopover && (
                <div className="fixed sm:absolute top-16 left-4 right-4 sm:left-auto sm:right-0 sm:top-full sm:mt-3 w-[calc(100vw-32px)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E8DACD] z-50 overflow-hidden animate-fadeIn">
                  <div className="p-4 bg-[#FAF5EF] border-b border-[#E8DACD] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiMessageSquare className="w-4 h-4 text-[#7A0C1E]" />
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Support Inquiries ({messages.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowMsgPopover(false);
                        navigate('/support/chat');
                      }}
                      className="text-[11px] font-black text-[#7A0C1E] hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E8DACD]">
                    {messages.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 font-bold">
                        No support messages recorded yet.
                      </div>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setShowMsgPopover(false);
                            navigate('/support/chat');
                          }}
                          className="p-4 hover:bg-[#FAF5EF]/60 transition-colors cursor-pointer text-left space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-900">{m.user_name || m.name || 'Customer'}</span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {m.last_message_at ? new Date(m.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (m.created_at ? new Date(m.created_at).toLocaleDateString() : '')}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">{m.last_message || 'New customer inquiry'}</p>
                          {m.unread_admin > 0 && (
                            <span className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#7A0C1E] text-white">
                              {m.unread_admin} UNREAD
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 text-center border-t border-[#E8DACD]">
                    <button
                      onClick={() => {
                        setShowMsgPopover(false);
                        navigate('/support/chat');
                      }}
                      className="text-xs font-black text-[#7A0C1E] hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Customer Support Center</span>
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Notifications Popover Bell Icon */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifPopover(!showNotifPopover);
                  setShowMsgPopover(false);
                  setShowProfileDropdown(false);
                }}
                className={`relative p-2.5 rounded-full transition-all cursor-pointer ${showNotifPopover ? 'bg-[#7A0C1E] text-white' : 'bg-[#FAF5EF] text-[#7A0C1E] hover:bg-[#F2E6DA] hover:text-[#5F0917]'
                  }`}
                title="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#7A0C1E] text-white font-black text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </button>

              {/* Notifications Floating Dropdown Popover */}
              {showNotifPopover && (
                <div className="fixed sm:absolute top-16 left-4 right-4 sm:left-auto sm:right-0 sm:top-full sm:mt-3 w-[calc(100vw-32px)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E8DACD] z-50 overflow-hidden animate-fadeIn">
                  <div className="p-4 bg-[#FAF5EF] border-b border-[#E8DACD] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiBell className="w-4 h-4 text-[#7A0C1E]" />
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Notifications ({notifications.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowNotifPopover(false);
                        navigate('/notifications');
                      }}
                      className="text-[11px] font-black text-[#7A0C1E] hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#E8DACD]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 font-bold">
                        No recent notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowNotifPopover(false);
                            navigate('/notifications');
                          }}
                          className="p-4 hover:bg-[#FAF5EF]/60 transition-colors cursor-pointer text-left space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-900 truncate max-w-[200px]">{n.title}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#7A0C1E]/20 text-[#7A0C1E] uppercase">
                              {n.type || 'system'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-gray-400 block pt-1">
                            {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 text-center border-t border-[#E8DACD]">
                    <button
                      onClick={() => {
                        setShowNotifPopover(false);
                        navigate('/notifications');
                      }}
                      className="text-xs font-black text-[#7A0C1E] hover:underline transition-colors inline-flex items-center gap-1"
                    >
                      <span>Go to Notification Center</span>
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Interactive Profile Card & Menu Dropdown */}
            <div className="relative pl-3 border-l border-[#E8DACD]" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifPopover(false);
                  setShowMsgPopover(false);
                }}
                className="flex items-center gap-3 group focus:outline-none cursor-pointer"
              >
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture.startsWith('http') ? user.profile_picture : `${getBackendURL()}${user.profile_picture.startsWith('/') ? '' : '/'}${user.profile_picture}`}
                    alt={user?.name || 'Fleur Notes Admin'}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#7A0C1E] shadow-sm group-hover:scale-105 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7A0C1E] to-[#5F0917] text-white flex items-center justify-center font-sans font-black text-sm border-2 border-[#E8DACD] shadow-sm group-hover:scale-105 transition-all">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'FN'}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-sm font-black text-gray-800 leading-snug group-hover:text-[#7A0C1E] transition-colors">
                    {user?.name || 'Fleur Notes Admin'}
                  </span>
                  <span className="text-xs text-gray-500 capitalize font-medium">
                    {user?.role || 'Admin'}
                  </span>
                </div>
                <FiChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className="fixed sm:absolute top-16 right-4 sm:right-0 sm:top-full sm:mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-[#E8DACD] z-50 overflow-hidden animate-fadeIn py-2">

                  {/* Dropdown Header Info */}
                  <div className="px-5 py-3 border-b border-[#E8DACD] bg-[#FAF5EF]">
                    <p className="text-xs font-black text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[11px] font-semibold text-gray-500 truncate mt-0.5">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7A0C1E]/20 text-[#7A0C1E] text-[10px] font-black uppercase">
                      <FiShield className="w-3 h-3 text-[#7A0C1E]" />
                      <span>{user?.role || 'Super Admin'}</span>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FAF5EF] hover:text-[#7A0C1E] flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <FiUser className="w-4 h-4 text-[#7A0C1E]" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#FAF5EF] hover:text-[#7A0C1E] flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <FiSettings className="w-4 h-4 text-[#7A0C1E]" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-[#E8DACD] pt-1">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to end your current session and logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="logout"
      />
    </>
  );
};

export default Navbar;