import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';

const Layout = () => {
  const location = useLocation();
  const setSidebarOpen = useAuthStore((state) => state.setSidebarOpen);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF5EF] font-sans antialiased text-gray-800 transition-colors duration-300">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main panel layout wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto bg-[#FAF5EF]">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;