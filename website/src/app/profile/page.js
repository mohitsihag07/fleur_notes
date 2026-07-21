'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  CheckCircle2
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoOffers, setPromoOffers] = useState(true);

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
      total: '$68.50',
      itemsCount: '2 items',
      status: 'Delivered',
      statusClass: 'bg-green-100 text-green-700',
      image: '/images/products/vase.jpg'
    },
    {
      id: '#FLR1189',
      date: 'May 05, 2024',
      total: '$42.00',
      itemsCount: '1 item',
      status: 'Shipped',
      statusClass: 'bg-amber-100 text-amber-700',
      image: '/images/products/candle.jpg'
    },
    {
      id: '#FLR1048',
      date: 'Apr 22, 2024',
      total: '$76.00',
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
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8DACD] p-4 shadow-sm h-fit space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F2E6DA] text-[#7A0C1E] border border-[#E8DACD]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
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
          <div className="lg:col-span-9 space-y-8">
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

                <button className="flex items-center gap-1 text-xs font-semibold px-3 py-2 border border-[#E8DACD] rounded-xl text-[#2B1B17] hover:bg-[#F2E6DA]">
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base text-[#2B1B17]">Your Orders</h3>
                <Link href="/orders" className="text-xs font-semibold text-[#7A0C1E] flex items-center gap-1 hover:underline">
                  <span>View All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
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

            {/* Quick Cards 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-[#E8DACD] p-5 flex items-start gap-4 hover:border-[#7A0C1E] transition-colors">
                <div className="p-3 rounded-full bg-[#F2E6DA] text-[#7A0C1E]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2B1B17]">Help & Support</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Find answers to common questions or contact support.</p>
                  <Link href="/contact" className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0C1E] mt-2">
                    <span>Get Help</span> <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8DACD] p-5 flex items-start gap-4 hover:border-[#7A0C1E] transition-colors">
                <div className="p-3 rounded-full bg-[#F2E6DA] text-[#7A0C1E]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2B1B17]">Your Refunds</h4>
                  <p className="text-xs text-gray-500 mt-0.5">View your refund status and history.</p>
                  <Link href="/refunds" className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0C1E] mt-2">
                    <span>View Refunds</span> <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8DACD] p-5 flex items-start gap-4 hover:border-[#7A0C1E] transition-colors">
                <div className="p-3 rounded-full bg-[#F2E6DA] text-[#7A0C1E]">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2B1B17]">Coupons</h4>
                  <p className="text-xs text-gray-500 mt-0.5">View and manage your saved coupons and offers.</p>
                  <Link href="/coupons" className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0C1E] mt-2">
                    <span>View Coupons</span> <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8DACD] p-5 flex items-start gap-4 hover:border-[#7A0C1E] transition-colors">
                <div className="p-3 rounded-full bg-[#F2E6DA] text-[#7A0C1E]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2B1B17]">Saved Addresses</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your saved addresses for faster checkout.</p>
                  <Link href="/addresses" className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0C1E] mt-2">
                    <span>Manage Addresses</span> <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Notifications Toggle Box */}
            <div className="bg-white rounded-2xl border border-[#E8DACD] p-6 shadow-sm space-y-4">
              <h4 className="font-semibold text-base text-[#2B1B17]">Notifications</h4>
              <p className="text-xs text-gray-500">Manage how you receive updates and offers.</p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-[#E8DACD]/60 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-[#2B1B17] block">Order Updates</span>
                    <span className="text-[11px] text-gray-400">Get notified about your order status.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={orderUpdates}
                    onChange={() => setOrderUpdates(!orderUpdates)}
                    className="w-5 h-5 accent-[#7A0C1E] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#2B1B17] block">Promotions & Offers</span>
                    <span className="text-[11px] text-gray-400">Receive offers, discounts and special promotions.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={promoOffers}
                    onChange={() => setPromoOffers(!promoOffers)}
                    className="w-5 h-5 accent-[#7A0C1E] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Refer & Earn Banner */}
            <div className="bg-[#F2E6DA] rounded-2xl border border-[#E8DACD] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="font-serif-luxury text-2xl font-bold text-[#2B1B17]">Refer & Earn</h3>
                <p className="text-xs text-gray-600">Invite your friends and earn rewards on their first order.</p>
                <button className="px-5 py-2.5 bg-[#7A0C1E] text-white text-xs font-bold rounded-xl mt-2 cursor-pointer">
                  Refer Now
                </button>
              </div>

              <div className="relative w-44 aspect-[16/9] rounded-xl overflow-hidden shrink-0 border border-[#E8DACD]">
                <Image src="/images/products/hamper.jpg" alt="Refer hamper" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
