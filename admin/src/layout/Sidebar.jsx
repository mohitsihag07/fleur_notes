import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import ConfirmModal from '../components/ConfirmModal';
import {
  FiGrid,
  FiBox,
  FiMessageSquare,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiTag,
  FiCreditCard,
  FiBell,
  FiStar,   
  FiHelpCircle,
  FiLogOut,
  FiUsers,
  FiImage
} from 'react-icons/fi';

const Sidebar = () => {
  const { logout, isSidebarOpen } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Users', path: '/users', icon: FiUsers },
    { name: 'Banners', path: '/banners', icon: FiImage },
    { name: 'Categories', path: '/categories', icon: FiBox },
    { name: 'Products', path: '/products', icon: FiFileText },
    { name: 'Orders', path: '/orders', icon: FiBarChart2 },
    { name: 'Coupons', path: '/coupons', icon: FiTag },
    { name: 'Payment', path: '/payment', icon: FiCreditCard },
    { name: 'Notifications', path: '/notifications', icon: FiBell },
    { name: 'Reviews', path: '/reviews', icon: FiStar },
    { name: 'Faqs', path: '/faqs', icon: FiHelpCircle },
    { name: 'CMS', path: '/cms', icon: FiFileText },
    { name: 'Contact Support', path: '/contact-support', icon: FiMessageSquare },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} h-screen bg-[#FF9D9D] text-[#2D252E] flex flex-col justify-between transition-all duration-300 z-30 shrink-0`}>

        {/* 1. TOP HEADER */}
        <div className={`p-6 shrink-0 flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center px-0'}`}>
          <div className="w-10 h-10 rounded-2xl bg-white overflow-hidden flex items-center justify-center shadow-sm shrink-0">
            <img src="/src/assets/logo.png" alt="Fleur Notes Logo" className="w-full h-full object-cover" />
          </div>
          {isSidebarOpen && (
            <span className="font-black text-2xl tracking-tight text-[#2D252E] font-sans truncate">
              FleurNotes
            </span>
          )}
        </div>

        {/* 2. MIDDLE MENU LIST */}
        <div className={`flex-1 overflow-y-auto no-scrollbar py-4 space-y-3 ${isSidebarOpen ? 'pl-4 pr-0' : 'px-2'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={!isSidebarOpen ? item.name : undefined}
                className={({ isActive }) =>
                  `relative flex items-center ${isSidebarOpen ? 'justify-between px-5 py-3.5' : 'justify-center p-3.5'} font-extrabold text-sm transition-all duration-200 ${isActive
                    ? `bg-[#EEF8CD] text-[#2D252E] font-black z-10 ${isSidebarOpen
                      ? 'rounded-l-full before:content-[""] before:absolute before:-top-4 before:right-0 before:w-4 before:h-4 before:bg-transparent before:rounded-br-2xl before:shadow-[4px_4px_0_4px_#EEF8CD] before:pointer-events-none after:content-[""] after:absolute after:-bottom-4 after:right-0 after:w-4 after:h-4 after:bg-transparent after:rounded-tr-2xl after:shadow-[4px_-4px_0_4px_#EEF8CD] after:pointer-events-none'
                      : 'rounded-2xl shadow-sm'
                    }`
                    : `text-[#2D252E] hover:bg-[#FFC5AA] hover:text-[#2D252E] ${isSidebarOpen ? 'rounded-full mr-4' : 'rounded-2xl'}`
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* 3. BOTTOM LOGOUT BUTTON */}
        <div className={`p-4 shrink-0 ${!isSidebarOpen ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => setShowLogoutModal(true)}
            title={!isSidebarOpen ? "Logout" : undefined}
            className={`flex items-center justify-center gap-3 ${isSidebarOpen ? 'w-full px-5 py-3.5 rounded-full' : 'w-12 h-12 rounded-2xl'} font-black text-sm bg-white text-red-500 hover:bg-[#FFC5AA] hover:text-[#2D252E] shadow-sm transition-all cursor-pointer`}
          >
            <FiLogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
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