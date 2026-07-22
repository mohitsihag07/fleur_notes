'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  MessageCircle
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileDetailsActive, setIsMobileDetailsActive] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoOffers, setPromoOffers] = useState(true);

  // Customer Support Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: 'Hello Ananya! Welcome to Fleur Notes Support. 🌸 How can we assist you with your orders, returns, or gifts today?',
      time: '12:00 PM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "Thank you for reaching out! A customer support representative will connect with you shortly.";
      const query = textToSend.toLowerCase();

      if (query.includes('track') || query.includes('order')) {
        replyText = "Checking your orders... 📦 Your order #FLR1256 was delivered on May 18, 2024. Your order #FLR1189 is currently Shipped and is expected to arrive by tomorrow evening!";
      } else if (query.includes('refund') || query.includes('return')) {
        replyText = "We offer a 30-day hassle-free return policy. I see you don't have any active refund requests. If you'd like to start a return for order #FLR1256, please let me know!";
      } else if (query.includes('coupon') || query.includes('discount')) {
        replyText = "You have 2 available coupons! You can use code WELCOME15 for 15% off your first order, or FLEUR10 for 10% off storewide at checkout. 🎟️";
      } else if (query.includes('hamper') || query.includes('gift')) {
        replyText = "We specialize in custom hampers! 🎁 You can build your own hamper in our Hamper Builder section or choose from our curated Gifts category.";
      } else if (query.includes('agent') || query.includes('human') || query.includes('talk')) {
        replyText = "Connecting you to a live support agent... 🧑‍💻 Please hold on for a moment.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'support',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const menuItems = [
    { id: 'profile', name: 'My Profile', icon: User },
    { id: 'orders', name: 'Your Orders', icon: ShoppingBag },
    { id: 'help', name: 'Help & Support', icon: HelpCircle },
    { id: 'refunds', name: 'Your Refunds', icon: RotateCcw },
    { id: 'coupons', name: 'Coupons', icon: Ticket },
    { id: 'addresses', name: 'Saved Addresses', icon: MapPin },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  const recentOrders = [
    {
      id: '#FLR1256',
      date: 'May 18, 2024',
      total: '₹6,850.00',
      itemsCount: '2 items',
      status: 'Delivered',
      statusClass: 'bg-green-100 text-green-700',
      image: '/images/products/vase.jpg'
    },
    {
      id: '#FLR1189',
      date: 'May 05, 2024',
      total: '₹4,200.00',
      itemsCount: '1 item',
      status: 'Shipped',
      statusClass: 'bg-amber-100 text-amber-700',
      image: '/images/products/candle.jpg'
    },
    {
      id: '#FLR1048',
      date: 'Apr 22, 2024',
      total: '₹7,600.00',
      itemsCount: '3 items',
      status: 'Delivered',
      statusClass: 'bg-green-100 text-green-700',
      image: '/images/categories/accessories.jpg'
    }
  ];

  return (
    <div className="bg-[#FAF5EF] min-h-screen py-10">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Menu */}
          <div className={`lg:col-span-3 bg-white rounded-2xl border border-[#E8DACD] p-4 shadow-sm h-fit space-y-1 ${
            isMobileDetailsActive ? 'hidden lg:block' : 'block'
          }`}>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold relative transition-colors ${
                    isActive ? 'text-[#7A0C1E]' : 'text-gray-600 hover:bg-gray-50/50'
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
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-red-50 text-[#7A0C1E] hover:bg-red-100 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Right Profile Main Dashboard Content */}
          <div className={`lg:col-span-9 space-y-8 ${
            isMobileDetailsActive ? 'block' : 'hidden lg:block'
          }`}>
            {isMobileDetailsActive && (
              <button
                onClick={() => setIsMobileDetailsActive(false)}
                className="lg:hidden flex items-center gap-2 text-xs font-bold text-[#7A0C1E] mb-2 bg-[#F2E6DA]/50 border border-[#E8DACD] px-4 py-2.5 rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Menu</span>
              </button>
            )}

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
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E8DACD] bg-[#FAF5EF]">
                      <Image
                        src="/images/categories/home_decor.jpg"
                        alt="Ananya Verma Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Hello, Ananya 🌿</h2>
                      </div>
                      <p className="text-xs text-gray-500">ananya.verma@email.com</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-[#E8DACD] pt-4 sm:pt-0 sm:pl-6 text-center text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Member since</span>
                      <span className="font-semibold text-[#2B1B17]">May 2023</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Total Orders</span>
                      <span className="font-semibold text-[#2B1B17]">12</span>
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
                    <Link href="/profile/edit" className="flex items-center gap-1 text-xs font-semibold px-3 py-2 border border-[#E8DACD] rounded-xl text-[#2B1B17] hover:bg-[#F2E6DA] transition-all">
                      <Edit className="w-3.5 h-3.5 text-[#7A0C1E]" />
                      <span>Edit Profile</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
                    <div className="space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Full Name</span>
                      <span className="font-semibold text-[#2B1B17] text-sm">Ananya Verma</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Email Address</span>
                      <span className="font-semibold text-[#2B1B17] text-sm">ananya.verma@email.com</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Phone Number</span>
                      <span className="font-semibold text-[#2B1B17] text-sm">+91 98765 43210</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Date of Birth</span>
                      <span className="font-semibold text-[#2B1B17] text-sm">March 15, 1996</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Gender</span>
                      <span className="font-semibold text-[#2B1B17] text-sm">Female</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Default Language</span>
                      <span className="font-semibold text-[#2B1B17] text-sm">English (IN)</span>
                    </div>

                    <div className="md:col-span-2 space-y-1 pt-2 border-t border-dashed border-[#E8DACD]/60">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Default Shipping Address</span>
                      <p className="font-medium text-[#2B1B17] leading-relaxed mt-0.5">
                        Flat 402, Lotus Apartments, Lane 5, Koregaon Park, Pune - 411001, Maharashtra, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              /* Recent Orders Section */
              <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif-luxury text-xl font-bold text-[#2B1B17]">Your Orders</h3>
                </div>

                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8DACD]/60 hover:bg-[#F2E6DA]/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E8DACD] bg-[#FAF5EF] shrink-0">
                          <Image src={order.image} alt={order.id} fill className="object-cover" />
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
              </div>
            )}

            {activeTab === 'help' && (
              /* Help & Support Section */
              <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#2B1B17]">Customer Support</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Chat with our Fleur Notes Support Assistant for immediate assistance.</p>
                </div>

                {/* Support Chat Widget */}
                <div className="border border-[#E8DACD] rounded-2xl overflow-hidden shadow-xs bg-white">
                  {/* Chat Header */}
                  <div className="bg-[#FAF5EF] border-b border-[#E8DACD] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#7A0C1E] text-white flex items-center justify-center font-serif-luxury font-bold text-xs relative">
                        FN
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#FAF5EF] rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#2B1B17]">Fleur Support Agent</h4>
                        <span className="text-[10px] text-green-600 font-medium">Online & ready to help</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages Log */}
                  <div className="h-72 overflow-y-auto px-4 py-4 bg-[#FAF5EF]/20 space-y-4 scroll-smooth">
                    {messages.map((msg) => {
                      const isSupport = msg.sender === 'support';
                      return (
                        <div key={msg.id} className={`flex gap-2.5 ${isSupport ? 'justify-start items-start' : 'justify-end items-end'}`}>
                          {isSupport && (
                            <div className="w-7 h-7 rounded-full bg-[#7A0C1E]/10 border border-[#A87B39]/20 flex items-center justify-center text-[#7A0C1E] shrink-0 font-serif-luxury text-[10px] font-bold">
                              FN
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-xs max-w-[75%] leading-relaxed ${
                              isSupport
                                ? 'bg-white border border-[#E8DACD] text-[#2B1B17] rounded-tl-none'
                                : 'bg-[#7A0C1E] text-white rounded-tr-none'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span className={`block text-[9px] text-right mt-1.5 ${isSupport ? 'text-gray-400' : 'text-white/70'}`}>
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing status indicator bubble */}
                    {isTyping && (
                      <div className="flex gap-2.5 items-start">
                        <div className="w-7 h-7 rounded-full bg-[#7A0C1E]/10 border border-[#A87B39]/20 flex items-center justify-center text-[#7A0C1E] shrink-0 font-serif-luxury text-[10px] font-bold">
                          FN
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
              /* Coupons Section */
              <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-4 animate-fadeIn">
                <h3 className="font-semibold text-base text-[#2B1B17]">Available Coupons</h3>
                <p className="text-xs text-gray-500">Use these promo codes at checkout to get discounts.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border border-dashed border-[#7A0C1E] bg-[#FAF5EF] p-4 rounded-xl space-y-2">
                    <span className="inline-block bg-[#7A0C1E] text-white text-[10px] font-bold px-2 py-0.5 rounded">15% OFF</span>
                    <h4 className="font-bold text-sm text-[#2B1B17] tracking-wider">WELCOME15</h4>
                    <p className="text-[10px] text-gray-500">15% off on your first order. No minimum purchase required.</p>
                  </div>
                  <div className="border border-dashed border-[#7A0C1E] bg-[#FAF5EF] p-4 rounded-xl space-y-2">
                    <span className="inline-block bg-[#7A0C1E] text-white text-[10px] font-bold px-2 py-0.5 rounded">10% OFF</span>
                    <h4 className="font-bold text-sm text-[#2B1B17] tracking-wider">FLEUR10</h4>
                    <p className="text-[10px] text-gray-500">10% off storewide. Applicable on all products.</p>
                  </div>
                </div>
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
                  <div className="p-4 rounded-xl border border-[#E8DACD] bg-[#FAF5EF]/30 relative">
                    <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Default</span>
                    <h4 className="font-bold text-xs text-[#2B1B17]">Home Address</h4>
                    <p className="text-[11px] text-gray-500 mt-2">
                      Ananya Verma<br />
                      Flat 402, Lotus Apartments, Lane 5<br />
                      Koregaon Park, Pune - 411001<br />
                      Maharashtra, India<br />
                      Phone: +91 98765 43210
                    </p>
                  </div>
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
                      className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        orderUpdates ? 'bg-[#7A0C1E]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          orderUpdates ? 'translate-x-5.5' : 'translate-x-0'
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
                      className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        promoOffers ? 'bg-[#7A0C1E]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          promoOffers ? 'translate-x-5.5' : 'translate-x-0'
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
