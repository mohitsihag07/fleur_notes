import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#EEF8CD] font-sans antialiased text-gray-800 transition-colors duration-300">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main panel layout wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;