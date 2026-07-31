'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { getBackendURL } from '@/services/api';

export function FloatingSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const chatEndRef = useRef(null);

  // Initialize or fetch support conversation
  const initChat = async () => {
    try {
      const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
      const initRes = await fetch(`${backendUrl}/api/users/support-chat/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: 'Ananya Verma', user_email: 'ananya.verma@email.com' })
      });
      const initData = await initRes.json();
      if (initData?.success && initData?.data) {
        const conv = initData.data;
        setConversation(conv);
        fetchMessages(conv.id);
      }
    } catch (err) {
      console.error('Failed to init floating support chat:', err);
    }
  };

  useEffect(() => {
    initChat();
  }, []);

  // Fetch Message History
  const fetchMessages = async (convId) => {
    try {
      const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';
      const res = await fetch(`${backendUrl}/api/users/support-chat/messages/${convId}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Error fetching floating chat messages:', err);
    }
  };

  // Real-time EventSource / SSE & Polling
  useEffect(() => {
    if (!conversation?.id) return;

    const backendUrl = getBackendURL ? getBackendURL() : 'http://localhost:3131';

    let eventSource;
    try {
      eventSource = new EventSource(`${backendUrl}/api/users/support-chat/stream?conversation_id=${conversation.id}`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.message) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.message.id)) return prev;
              if (!isOpen && payload.message.sender_type === 'admin') {
                setUnreadCount((c) => c + 1);
              }
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

    const interval = setInterval(() => {
      fetchMessages(conversation.id);
    }, 3000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [conversation?.id, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Reset unread count on open
  const handleToggleOpen = () => {
    if (!isOpen) {
      setUnreadCount(0);
      if (!conversation) initChat();
    }
    setIsOpen(!isOpen);
  };

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

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Expanded Live Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[330px] sm:w-[380px] h-[480px] bg-white rounded-3xl shadow-2xl border border-[#E8DACD] flex flex-col overflow-hidden animate-fadeIn">
          {/* Chat Window Header */}
          <div className="bg-[#7A0C1E] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-serif-luxury font-bold text-xs relative">
                C
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#7A0C1E] rounded-full animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-serif-luxury tracking-wide">Fleur Notes Support</h4>
                <span className="text-[10px] text-green-300 font-medium">Online • Live Assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF5EF]/20 scroll-smooth">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-[#7A0C1E]/40" />
                <p>Hello! Welcome to Fleur Notes Support. 🌸</p>
                <p className="text-[11px] text-gray-400">Ask us anything about products, orders, or gifts!</p>
              </div>
            ) : (
              messages.map((msg) => {
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
                  <div key={msg.id || Math.random()} className={`flex gap-2 ${isSupport ? 'justify-start items-start' : 'justify-end items-end'}`}>
                    {isSupport && (
                      <div className="w-6 h-6 rounded-full bg-[#7A0C1E]/10 border border-[#A87B39]/20 flex items-center justify-center text-[#7A0C1E] shrink-0 font-serif-luxury text-[9px] font-bold">
                        C
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-xs max-w-[80%] leading-relaxed ${
                        isSupport
                          ? 'bg-white border border-[#E8DACD] text-[#2B1B17] rounded-tl-none shadow-2xs'
                          : 'bg-[#7A0C1E] text-white rounded-tr-none shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message || msg.text}</p>
                      <span className={`block text-[8px] text-right mt-1 ${isSupport ? 'text-gray-400' : 'text-white/70'}`}>
                        {timeStr}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-[#E8DACD]/60 flex gap-1.5 overflow-x-auto no-scrollbar">
            {['Track Order', 'Refund Status', 'Active Coupons', 'Talk to Agent'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSendMessage(tag)}
                className="shrink-0 px-2.5 py-1 bg-[#FAF5EF] hover:bg-[#F2E6DA] border border-[#E8DACD] hover:text-[#7A0C1E] rounded-full text-[10px] font-semibold text-[#705B54] transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Chat Reply Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 bg-white border-t border-[#E8DACD] flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3.5 py-2 border border-[#E8DACD] rounded-xl text-xs focus:outline-none focus:border-[#7A0C1E] focus:ring-1 focus:ring-[#7A0C1E]/20 bg-[#FAF5EF]/30"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2 bg-[#7A0C1E] hover:bg-[#5F0917] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shrink-0"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* Trigger Floating Action Button */}
      <button
        onClick={handleToggleOpen}
        className="relative w-14 h-14 rounded-full bg-[#7A0C1E] hover:bg-[#5F0917] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/40"
        title="Live Customer Support Chat"
      >
        {isOpen ? <Minimize2 className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-400 text-[#7A0C1E] font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
