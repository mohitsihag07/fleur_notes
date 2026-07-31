import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSettingsStore from '../store/settingsStore';
import ConfirmModal from '../components/ConfirmModal';
import {
  FiGrid,
  FiPackage,
  FiMessageSquare,
  FiShoppingBag,
  FiFileText,
  FiSettings,
  FiTag,
  FiCreditCard,
  FiBell,
  FiStar,
  FiHelpCircle,
  FiLogOut,
  FiUsers,
  FiImage,
  FiLayers,
  FiHeadphones
} from 'react-icons/fi';

const Sidebar = () => {
  const { logout, isSidebarOpen, toggleSidebar } = useAuthStore();
  const getLogoUrl = useSettingsStore((state) => state.getLogoUrl);
  const getSiteName = useSettingsStore((state) => state.getSiteName);
  const getTagline = useSettingsStore((state) => state.getTagline);
  const logoUrl = getLogoUrl();
  const siteName = getSiteName();
  const siteTagline = getTagline();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Users', path: '/users', icon: FiUsers },
    { name: 'Banners', path: '/banners', icon: FiImage },
    { name: 'Categories', path: '/categories', icon: FiLayers },
    { name: 'Products', path: '/products', icon: FiPackage },
    { name: 'Orders', path: '/orders', icon: FiShoppingBag },
    { name: 'Coupons', path: '/coupons', icon: FiTag },
    { name: 'Payment', path: '/payment', icon: FiCreditCard },
    { name: 'Notifications', path: '/notifications', icon: FiBell },
    { name: 'Reviews', path: '/reviews', icon: FiStar },
    { name: 'Faqs', path: '/faqs', icon: FiHelpCircle },
    { name: 'CMS', path: '/cms', icon: FiFileText },
    { name: 'Live Support Chat', path: '/support/chat', icon: FiMessageSquare },
    { name: 'Contact Support', path: '/contact-support', icon: FiHeadphones },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 ${
          isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
        } h-screen bg-[#7A0C1E] text-white flex flex-col justify-between transition-all duration-300 shrink-0 shadow-2xl md:shadow-none`}
      >

        {/* 1. TOP HEADER */}
        <div className={`p-5 shrink-0 flex items-center ${isSidebarOpen ? 'gap-3.5' : 'justify-center px-0'}`}>
          <div className="w-11 h-11 rounded-2xl bg-white overflow-hidden flex items-center justify-center shadow-md shrink-0 ring-2 ring-[#FAF5EF]/90 p-0.5">
            <img
              src={logoUrl}
              alt="Logo"
              onError={(e) => {
                e.target.src = '/logo.jpg';
              }}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-serif font-black text-xl tracking-wide text-white truncate uppercase">
                {siteName}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#FAF5EF] uppercase truncate">
                {siteTagline}
              </span>
            </div>
          )}
        </div>

        {/* 2. MIDDLE MENU LIST */}
        <div className={`flex-1 overflow-y-auto no-scrollbar py-4 space-y-2.5 ${isSidebarOpen ? 'pl-4 pr-0' : 'px-2'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768 && isSidebarOpen) {
                    toggleSidebar();
                  }
                }}
                title={!isSidebarOpen ? item.name : undefined}
                className={({ isActive }) =>
                  `relative flex items-center ${isSidebarOpen ? 'justify-between px-5 py-3.5' : 'justify-center p-3.5'} font-bold text-sm tracking-wide transition-all duration-300 ease-in-out ${isActive
                    ? `bg-[#FAF5EF] text-[#7A0C1E] font-black z-10 ${isSidebarOpen
                      ? 'rounded-l-full before:content-[""] before:absolute before:-top-4 before:right-0 before:w-4 before:h-4 before:bg-transparent before:rounded-br-2xl before:shadow-[4px_4px_0_4px_#FAF5EF] before:pointer-events-none before:transition-opacity before:duration-300 before:opacity-100 after:content-[""] after:absolute after:-bottom-4 after:right-0 after:w-4 after:h-4 after:bg-transparent after:rounded-tr-2xl after:shadow-[4px_-4px_0_4px_#FAF5EF] after:pointer-events-none after:transition-opacity after:duration-300 after:opacity-100'
                      : 'rounded-2xl shadow-sm'
                    }`
                    : `text-white hover:bg-[#5F0917] hover:text-white ${isSidebarOpen
                      ? 'rounded-l-full before:content-[""] before:absolute before:-top-4 before:right-0 before:w-4 before:h-4 before:bg-transparent before:rounded-br-2xl before:shadow-[4px_4px_0_4px_#FAF5EF] before:pointer-events-none before:transition-opacity before:duration-300 before:opacity-0 after:content-[""] after:absolute after:-bottom-4 after:right-0 after:w-4 after:h-4 after:bg-transparent after:rounded-tr-2xl after:shadow-[4px_-4px_0_4px_#FAF5EF] after:pointer-events-none after:transition-opacity after:duration-300 after:opacity-0'
                      : 'rounded-2xl'
                    }`
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5.5 h-5.5 shrink-0" />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* 3. BOTTOM LOGOUT BUTTON (Red retained for action clarity) */}
        <div className={`p-4 shrink-0 ${!isSidebarOpen ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => setShowLogoutModal(true)}
            title={!isSidebarOpen ? "Logout" : undefined}
            className={`flex items-center justify-center gap-3 ${isSidebarOpen ? 'w-full px-5 py-3.5 rounded-full' : 'w-12 h-12 rounded-2xl'} font-bold text-sm bg-red-500/20 border border-red-500/40 text-[#FF8A8A] hover:bg-red-600 hover:text-white shadow-md transition-all cursor-pointer`}
          >
            <FiLogOut className="w-5.5 h-5.5 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

      </aside>

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

export default Sidebar;