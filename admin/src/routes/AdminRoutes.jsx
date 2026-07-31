import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSettingsStore from '../store/settingsStore';
import Layout from '../layout/Layout';

// Auth pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';

// App pages
import Dashboard from '../pages/dashboard/Dashboard';
import Users from '../pages/users/Users';
import GetUsers from '../pages/users/GetUsers';
import Categories from '../pages/categories/Categories';
import AddCategory from '../pages/categories/AddCategory';
import UpdateCategory from '../pages/categories/UpdateCategory';
import GetCategory from '../pages/categories/GetCategory';
import Products from '../pages/products/Products';
import AddProduct from '../pages/products/AddProduct';
import UpdateProduct from '../pages/products/UpdateProduct';
import GetProduct from '../pages/products/GetProduct';
import Coupons from '../pages/coupons/Coupons';
import AddCoupon from '../pages/coupons/AddCoupon';
import UpdateCoupon from '../pages/coupons/UpdateCoupon';
import GetCoupon from '../pages/coupons/GetCoupon';
import Profile from '../pages/admin/Profile';
import Settings from '../pages/settings/Settings';
import Notifications from '../pages/notifications/Notifications';
import ContactSupport from '../pages/support/ContactSupport';
import LiveSupportChat from '../pages/support/LiveSupportChat';
import Reviews from '../pages/reviews/Reviews';
import FAQs from '../pages/faqs/FAQs';
import AddFAQ from '../pages/faqs/AddFAQ';
import UpdateFAQ from '../pages/faqs/UpdateFAQ';
import GetFAQ from '../pages/faqs/GetFAQ';
import CMSPage from '../pages/cms/CMSPage';
import Orders from '../pages/orders/Orders';
import GetOrder from '../pages/orders/GetOrder';
import Payments from '../pages/payments/Payments';
import Banners from '../pages/banners/Banners';
import AddBanner from '../pages/banners/AddBanner';
import UpdateBanner from '../pages/banners/UpdateBanner';
import GetBanner from '../pages/banners/GetBanner';

const ReportedUsers = () => (
  <div className="admin-card transition-theme text-app-text">
    <h2 className="text-xl font-bold mb-2">Reported Users</h2>
    <p className="text-app-text-muted">This module is currently in development.</p>
  </div>
);

// Route Guard for unauthenticated pages (like login)
const RequireUnauth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#121212] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#B22222]"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route Guard for authenticated pages
const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#121212] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#B22222]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoutes = () => {
  const { initialize } = useAuthStore();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    initialize();
    fetchSettings();
  }, [initialize, fetchSettings]);

  return (
    <Routes>
      {/* Public Auth routes */}
      <Route
        path="/login"
        element={
          <RequireUnauth>
            <Login />
          </RequireUnauth>
        }
      />
      <Route
        path="/admin/login"
        element={
          <RequireUnauth>
            <Login />
          </RequireUnauth>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RequireUnauth>
            <ForgotPassword />
          </RequireUnauth>
        }
      />
      <Route
        path="/admin/forgot-password"
        element={
          <RequireUnauth>
            <ForgotPassword />
          </RequireUnauth>
        }
      />

      {/* Secure Layout routes */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<GetUsers />} />
        
        {/* Dedicated Catalog Pages */}
        <Route path="categories" element={<Categories />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="categories/edit/:id" element={<UpdateCategory />} />
        <Route path="categories/:id" element={<GetCategory />} />
        
        {/* Dedicated Products Pages */}
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<UpdateProduct />} />
        <Route path="products/:id" element={<GetProduct />} />
        
        {/* Dedicated Coupons Pages */}
        <Route path="coupons" element={<Coupons />} />
        <Route path="coupons/add" element={<AddCoupon />} />
        <Route path="coupons/edit/:id" element={<UpdateCoupon />} />
        <Route path="coupons/:id" element={<GetCoupon />} />
        
        {/* Orders Management */}
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<GetOrder />} />

        {/* Payments Management */}
        <Route path="payment" element={<Payments />} />
        <Route path="payments" element={<Payments />} />

        {/* Banner Management */}
        <Route path="banners" element={<Banners />} />
        <Route path="banners/add" element={<AddBanner />} />
        <Route path="banners/edit/:id" element={<UpdateBanner />} />
        <Route path="banners/:id" element={<GetBanner />} />
        <Route path="banner" element={<Banners />} />

        {/* Alias redirects for /admin/* routes */}
        <Route path="admin/banners" element={<Navigate to="/banners" replace />} />
        <Route path="admin/banners/add" element={<Navigate to="/banners/add" replace />} />
        <Route path="admin/banners/edit/:id" element={<Navigate to="/banners/edit/:id" replace />} />
        <Route path="admin/banners/:id" element={<Navigate to="/banners/:id" replace />} />
        <Route path="admin/categories" element={<Navigate to="/categories" replace />} />
        <Route path="admin/categories/add" element={<Navigate to="/categories/add" replace />} />
        <Route path="admin/categories/edit/:id" element={<Navigate to="/categories/edit/:id" replace />} />
        <Route path="admin/categories/:id" element={<Navigate to="/categories/:id" replace />} />
        <Route path="admin/products" element={<Navigate to="/products" replace />} />
        <Route path="admin/products/add" element={<Navigate to="/products/add" replace />} />
        <Route path="admin/products/edit/:id" element={<Navigate to="/products/edit/:id" replace />} />
        <Route path="admin/products/:id" element={<Navigate to="/products/:id" replace />} />
        <Route path="admin/orders" element={<Navigate to="/orders" replace />} />
        <Route path="admin/orders/:id" element={<Navigate to="/orders/:id" replace />} />
        <Route path="admin/users" element={<Navigate to="/users" replace />} />
        <Route path="admin/users/:id" element={<Navigate to="/users/:id" replace />} />
        
        <Route path="cms" element={<CMSPage />} />

        {/* Notifications & Communication */}
        <Route path="notifications" element={<Notifications />} />

        {/* Product Reviews & Ratings */}
        <Route path="reviews" element={<Reviews />} />

        {/* FAQs Management */}
        <Route path="faqs" element={<FAQs />} />
        <Route path="faqs/add" element={<AddFAQ />} />
        <Route path="faqs/edit/:id" element={<UpdateFAQ />} />
        <Route path="faqs/:id" element={<GetFAQ />} />

        {/* Contact Support & Live Support Chat */}
        <Route path="contact-support" element={<ContactSupport />} />
        <Route path="support/chat" element={<LiveSupportChat />} />
        <Route path="reported-users" element={<ReportedUsers />} />

        <Route path="profile" element={<Profile />} />

        {/* Settings page */}
        <Route path="settings" element={<Settings />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;