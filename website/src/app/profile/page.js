'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShoppingBag,
  HelpCircle,
  RotateCcw,
  Ticket,
  MapPin,
  Bell,
  LogOut,
  Edit,
  ChevronRight,
  Gift,
  CheckCircle2,
  ArrowLeft,
  Send,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { getBackendURL } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileDetailsActive, setIsMobileDetailsActive] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoOffers, setPromoOffers] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Dynamic Customer Support Live Chat State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editGender, setEditGender] = useState(user?.gender || '');
  const [editDob, setEditDob] = useState(user?.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '');
  const [editAddress, setEditAddress] = useState(user?.address || user?.default_address || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditGender(user.gender || '');
      setEditDob(user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '');
      setEditAddress(user.address || user.default_address || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const savedToken = localStorage.getItem('user_token');
      const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
      const res = await fetch(`${backendUrl}/api/users/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          name: editName,
          gender: editGender,
          date_of_birth: editDob,
          address: editAddress
        })
      });
      const data = await res.json();
      if (data?.success && data?.data?.user) {
        const updatedUser = { ...user, ...data.data.user };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setIsEditing(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsUpdating(false);
    }
  };
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Handle URL query parameter ?tab=help
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const lower = tabParam.toLowerCase();
      if (['help', 'support', 'chat'].includes(lower)) {
        setActiveTab('help');
      } else {
        setActiveTab(tabParam);
      }
    } else {
      setActiveTab('profile');
    }
    setIsMobileDetailsActive(true);
  }, [searchParams]);

  // Initialize or fetch support conversation on load or when Help tab opens
  useEffect(() => {
    async function initChat() {
      try {
        const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
        const initRes = await fetch(`${backendUrl}/api/users/support-chat/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_name: user?.name || 'Customer', 
            user_email: user?.email || (user?.phone ? `+91 ${user.phone}` : 'customer@caflore.com') 
          })
        });
        const initData = await initRes.json();
        if (initData?.success && initData?.data) {
          const conv = initData.data;
          setConversation(conv);
          fetchMessages(conv.id);
        }
      } catch (err) {
        console.error('Failed to init support chat:', err);
      }
    }
    if (activeTab === 'help') {
      initChat();
    }
  }, [activeTab]);

  // Fetch Message History
  const fetchMessages = async (convId) => {
    try {
      const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
      const res = await fetch(`${backendUrl}/api/users/support-chat/messages/${convId}`);
      const data = await res.json();
      if (data?.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  // Real-time EventSource / SSE & Polling fallback for live messages
  useEffect(() => {
    if (!conversation?.id || activeTab !== 'help') return;

    const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';

    // 1. SSE EventSource
    let eventSource;
    try {
      eventSource = new EventSource(`${backendUrl}/api/users/support-chat/stream?conversation_id=${conversation.id}`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.message.id)) return prev;
              return [...prev, payload.message];
            });
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };
    } catch (e) {
      console.error('SSE initialization error:', e);
    }

    // 2. Poll every 3 seconds for backup real-time sync
    const interval = setInterval(() => {
      fetchMessages(conversation.id);
    }, 3000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [conversation?.id, activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (textToSend) => {
    if (!textToSend || !textToSend.trim() || !conversation?.id || isSending) return;
    setIsSending(true);

    try {
      const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
      const res = await fetch(`${backendUrl}/api/users/support-chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversation.id,
          message: textToSend.trim(),
          user_name: 'Ananya Verma'
        })
      });
      const data = await res.json();
      if (data?.success && data?.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
        setInputText('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Dynamic Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Dynamic Coupons State
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    async function fetchCoupons() {
      setLoadingCoupons(true);
      try {
        const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
        const res = await fetch(`${backendUrl}/api/users/coupons`);
        const data = await res.json();
        if (data?.success && data?.data) {
          setCoupons(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
      } finally {
        setLoadingCoupons(false);
      }
    }

    if (activeTab === 'coupons') {
      fetchCoupons();
    }
  }, [activeTab]);

  useEffect(() => {
    async function fetchUserOrders() {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      if (!savedToken) return;
      setLoadingOrders(true);
      try {
        const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
        const res = await fetch(`${backendUrl}/api/users/orders`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });
        const data = await res.json();
        if (data?.success && data?.data) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (isLoggedIn && (activeTab === 'orders' || activeTab === 'profile')) {
      fetchUserOrders();
    }
  }, [isLoggedIn, activeTab]);

  const menuItems = [
    { id: 'profile', name: 'My Profile', icon: User },
    { id: 'orders', name: 'Your Orders', icon: ShoppingBag },
    { id: 'help', name: 'Help & Support', icon: HelpCircle },
    { id: 'refunds', name: 'Your Refunds', icon: RotateCcw },
    { id: 'coupons', name: 'Coupons', icon: Ticket },
    { id: 'addresses', name: 'Saved Addresses', icon: MapPin },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('user_token'));

  if (authLoading || (hasToken && !isLoggedIn)) {
    return (
      <div className="bg-[#FAF5EF] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="flex items-center gap-3 font-semibold text-[#7A0C1E] text-xs">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading profile details...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-[#FAF5EF] min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DACD] p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#7A0C1E]/10 text-[#7A0C1E] flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Sign In Required</h2>
          <p className="text-xs text-[#705B54]">
            Please sign in to view your profile, track orders, and connect with customer support.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Menu (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-[#E8DACD] p-4 shadow-sm h-fit space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileDetailsActive(true);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold relative transition-colors ${isActive ? 'text-[#7A0C1E]' : 'text-gray-600 hover:bg-gray-50/50'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeProfileTabBg"
                      className="absolute inset-0 bg-[#F2E6DA] border border-[#E8DACD] rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </button>
              );
            })}

            <div className="pt-4 border-t border-[#E8DACD]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-red-50 text-[#7A0C1E] hover:bg-red-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Profile Main Dashboard Content */}
          <div className="lg:col-span-9 space-y-8">

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Profile Header User Card */}
                    <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E8DACD] bg-[#7A0C1E] text-white flex items-center justify-center font-serif-luxury text-2xl font-bold shrink-0">
                          {user?.profile_picture ? (
                            <img src={user.profile_picture} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(user?.name || 'Customer').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">
                              Hello, {user?.name || 'Customer'} 🌿
                            </h2>
                          </div>
                          <p className="text-xs text-gray-500">{user?.email || (user?.phone ? `+91 ${user.phone}` : 'No email address registered')}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-[#E8DACD] pt-4 sm:pt-0 sm:pl-6 text-center text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Member since</span>
                          <span className="font-semibold text-[#2B1B17]">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'May 18, 2024'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Total Orders</span>
                          <span className="font-semibold text-[#2B1B17]">{orders.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Account Status</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Profile Info Card */}
                    <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-[#E8DACD]/60">
                        <h3 className="font-serif-luxury text-xl font-bold text-[#2B1B17]">Personal Details</h3>
                        <Link
                          href="/profile/edit"
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border border-[#E8DACD] rounded-xl text-[#7A0C1E] bg-[#FAF5EF] hover:bg-[#F2E6DA] transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
                        <div className="space-y-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Full Name</span>
                          <span className="font-semibold text-[#2B1B17] text-sm">{user?.name || 'Customer'}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Email Address</span>
                          <span className="font-semibold text-[#2B1B17] text-sm">{user?.email || 'Not provided'}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Phone Number</span>
                          <span className="font-semibold text-[#2B1B17] text-sm">{user?.phone ? `+91 ${user.phone}` : 'Not provided'}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Date of Birth</span>
                          <span className="font-semibold text-[#2B1B17] text-sm">
                            {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not specified'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Gender</span>
                          <span className="font-semibold text-[#2B1B17] text-sm">
                            {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Default Language</span>
                          <span className="font-semibold text-[#2B1B17] text-sm">English (IN)</span>
                        </div>

                        <div className="md:col-span-2 space-y-1 pt-2 border-t border-dashed border-[#E8DACD]/60">
                          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Default Shipping Address</span>
                          <p className="font-medium text-[#2B1B17] leading-relaxed mt-0.5">
                            {user?.address || user?.default_address || 'No default shipping address added yet.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  /* Dynamic Orders Section */
                  <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif-luxury text-xl font-bold text-[#2B1B17]">Your Orders</h3>
                      <span className="text-xs text-gray-500">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
                    </div>

                    {loadingOrders ? (
                      <div className="text-center py-12">
                        <div className="w-6 h-6 border-2 border-[#7A0C1E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Loading your orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12 bg-[#FAF5EF]/30 rounded-xl border border-dashed border-[#E8DACD]">
                        <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <h4 className="font-bold text-xs text-[#2B1B17]">No Orders Placed Yet</h4>
                        <p className="text-[11px] text-gray-500 mt-1">When you place an order, it will show up here.</p>
                        <Link href="/shop" className="inline-block mt-4 px-4 py-2 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#5F0917] transition-all">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8DACD]/60 hover:bg-[#F2E6DA]/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E8DACD] bg-[#FAF5EF] shrink-0">
                                <img src={order.image} alt={order.id} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-[#2B1B17]">Order {order.id}</h4>
                                <p className="text-[11px] text-gray-500">{order.date} • {order.itemsCount}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-bold text-xs text-[#2B1B17]">{order.total}</span>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${order.statusClass}`}>
                                {order.status}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'help' && (
                  /* Help & Support Section */
                  <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-6 animate-fadeIn">
                    <div>
                      <h3 className="font-serif-luxury text-xl font-bold text-[#2B1B17]">Customer Support</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Chat with our Caflore Support Assistant for immediate assistance.</p>
                    </div>

                    {/* Support Chat Widget */}
                    <div className="border border-[#E8DACD] rounded-2xl overflow-hidden shadow-xs bg-white">
                      {/* Chat Header */}
                      <div className="bg-[#FAF5EF] border-b border-[#E8DACD] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#7A0C1E] text-white flex items-center justify-center font-serif-luxury font-bold text-xs relative">
                            C
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#FAF5EF] rounded-full animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#2B1B17]">CafloreSupport Agent</h4>
                            <span className="text-[10px] text-green-600 font-medium">Online & ready to help</span>
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages Log */}
                      <div className="h-72 overflow-y-auto px-4 py-4 bg-[#FAF5EF]/20 space-y-4 scroll-smooth">
                        {messages.map((msg) => {
                          const isSupport = msg.sender_type === 'admin' || msg.sender === 'support';
                          const isSystem = msg.sender_type === 'system';
                          const timeStr = msg.created_at
                            ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : (msg.time || 'Just now');

                          if (isSystem) {
                            return (
                              <div key={msg.id || Math.random()} className="text-center py-1">
                                <span className="px-3 py-1 bg-[#F2E6DA] text-[#7A0C1E] rounded-full text-[10px] font-bold border border-[#E8DACD]">
                                  {msg.message || msg.text}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div key={msg.id || Math.random()} className={`flex gap-2.5 ${isSupport ? 'justify-start items-start' : 'justify-end items-end'}`}>
                              {isSupport && (
                                <div className="w-7 h-7 rounded-full bg-[#7A0C1E]/10 border border-[#A87B39]/20 flex items-center justify-center text-[#7A0C1E] shrink-0 font-serif-luxury text-[10px] font-bold">
                                  C
                                </div>
                              )}
                              <div
                                className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-xs max-w-[75%] leading-relaxed ${isSupport
                                    ? 'bg-white border border-[#E8DACD] text-[#2B1B17] rounded-tl-none'
                                    : 'bg-[#7A0C1E] text-white rounded-tr-none'
                                  }`}
                              >
                                <p>{msg.message || msg.text}</p>
                                <span className={`block text-[9px] text-right mt-1.5 ${isSupport ? 'text-gray-400' : 'text-white/70'}`}>
                                  {timeStr}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Typing status indicator bubble */}
                        {isTyping && (
                          <div className="flex gap-2.5 items-start">
                            <div className="w-7 h-7 rounded-full bg-[#7A0C1E]/10 border border-[#A87B39]/20 flex items-center justify-center text-[#7A0C1E] shrink-0 font-serif-luxury text-[10px] font-bold">
                              C
                            </div>
                            <div className="bg-white border border-[#E8DACD] text-gray-500 rounded-2xl rounded-tl-none px-3.5 py-3 shadow-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat Quick Answers Chips */}
                      <div className="px-4 py-2 border-t border-[#E8DACD]/60 bg-white flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                        {['Track Order', 'Refund Status', 'Active Coupons', 'Talk to Agent'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleSendMessage(tag)}
                            className="shrink-0 px-3 py-1.5 bg-[#FAF5EF]/50 hover:bg-[#F2E6DA] border border-[#E8DACD] hover:border-[#A87B39]/50 hover:text-[#7A0C1E] rounded-full text-[10px] font-semibold text-[#705B54] transition-all cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Chat Input Area */}
                      <div className="p-3 bg-[#FAF5EF]/30 border-t border-[#E8DACD]">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage(inputText);
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-1 px-4 py-2.5 border border-[#E8DACD] rounded-xl text-xs focus:outline-none focus:border-[#7A0C1E] focus:ring-1 focus:ring-[#7A0C1E]/20 bg-white"
                          />
                          <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="p-2.5 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl transition-all cursor-pointer shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* FAQ Quick Link Section */}
                    <div className="pt-2 border-t border-[#E8DACD]/60 space-y-3">
                      <h4 className="text-xs font-bold text-[#2B1B17] uppercase tracking-wider">Frequently Asked Questions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-[#E8DACD]/60 bg-[#FAF5EF]/30">
                          <h5 className="font-bold text-[11px] text-[#2B1B17]">How do I track my order?</h5>
                          <p className="text-[10px] text-gray-500 mt-1">Details are automatically sent via email/SMS. You can also ask our Support Assistant above.</p>
                        </div>
                        <div className="p-3 rounded-xl border border-[#E8DACD]/60 bg-[#FAF5EF]/30">
                          <h5 className="font-bold text-[11px] text-[#2B1B17]">What is your refund policy?</h5>
                          <p className="text-[10px] text-gray-500 mt-1">We offer a 30-day hassle-free return policy. Return items must be in original condition.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'refunds' && (
                  /* Refunds Section */
                  <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-4 animate-fadeIn">
                    <h3 className="font-semibold text-base text-[#2B1B17]">Your Refunds</h3>
                    <p className="text-xs text-gray-500">View status and history of your recent refunds.</p>
                    <div className="text-center py-8">
                      <RotateCcw className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-spin" style={{ animationDuration: '3s' }} />
                      <p className="text-xs text-gray-500">No active or previous refunds found.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'coupons' && (
                  /* Dynamic Coupons Section */
                  <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-base text-[#2B1B17]">Available Coupons</h3>
                        <p className="text-xs text-gray-500">Use these promo codes at checkout to get discounts.</p>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{coupons.length} {coupons.length === 1 ? 'coupon' : 'coupons'} available</span>
                    </div>

                    {loadingCoupons ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-[#7A0C1E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Loading coupons...</p>
                      </div>
                    ) : coupons.length === 0 ? (
                      <div className="text-center py-8 bg-[#FAF5EF]/30 rounded-xl border border-dashed border-[#E8DACD]">
                        <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 font-medium">No active promo coupons available right now.</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Check back later for seasonal discounts and special offers.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {coupons.map((coupon) => (
                          <div key={coupon.id} className="border border-dashed border-[#7A0C1E] bg-[#FAF5EF] p-4 rounded-xl space-y-2 relative group hover:border-[#5F0917] transition-colors">
                            <span className="inline-block bg-[#7A0C1E] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              {coupon.discountText}
                            </span>
                            <h4 className="font-bold text-sm text-[#2B1B17] tracking-wider font-mono">{coupon.code}</h4>
                            <p className="text-[10px] text-gray-600 leading-relaxed">{coupon.description}</p>
                            {coupon.expiryDate && (
                              <span className="block text-[9px] text-gray-400 font-medium pt-1 border-t border-[#E8DACD]/60">
                                Expires: {coupon.expiryDate}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  /* Saved Addresses Section */
                  <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-base text-[#2B1B17]">Saved Addresses</h3>
                        <p className="text-xs text-gray-500">Manage your shipping and billing addresses.</p>
                      </div>
                      <Link href="/profile/addresses/add" className="py-2 px-3 border border-[#E8DACD] rounded-xl text-xs font-semibold text-[#2B1B17] hover:bg-[#F2E6DA]">
                        Add New Address
                      </Link>
                    </div>
                    <div className="pt-2">
                      {user?.address || user?.default_address ? (
                        <div className="p-4 rounded-xl border border-[#E8DACD] bg-[#FAF5EF]/30 relative">
                          <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Default</span>
                          <h4 className="font-bold text-xs text-[#2B1B17]">{user?.name || 'Customer'}</h4>
                          <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                            {user.address || user.default_address}<br />
                            {user?.phone && `Phone: +91 ${user.phone}`}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-[#FAF5EF]/30 rounded-xl border border-dashed border-[#E8DACD]">
                          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 font-medium">No saved addresses found.</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Add a shipping address during checkout or click above.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  /* Notifications Toggle Box */
                  <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-4 animate-fadeIn">
                    <h4 className="font-semibold text-base text-[#2B1B17]">Notifications</h4>
                    <p className="text-xs text-gray-500">Manage how you receive updates and offers.</p>

                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between border-b border-[#E8DACD]/40 pb-4">
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-[#2B1B17] block">Order Updates</span>
                          <span className="text-xs text-gray-400">Get notified about your order status.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOrderUpdates(!orderUpdates)}
                          className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${orderUpdates ? 'bg-[#7A0C1E]' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${orderUpdates ? 'translate-x-5.5' : 'translate-x-0'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-[#2B1B17] block">Promotions & Offers</span>
                          <span className="text-xs text-gray-400">Receive offers, discounts and special promotions.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPromoOffers(!promoOffers)}
                          className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${promoOffers ? 'bg-[#7A0C1E]' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${promoOffers ? 'translate-x-5.5' : 'translate-x-0'
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF5EF]" />}>
      <ProfileContent />
    </Suspense>
  );
}
