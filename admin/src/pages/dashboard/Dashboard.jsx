import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiUsers, 
  FiBox, 
  FiXCircle, 
  FiTrendingUp, 
  FiDollarSign, 
  FiArrowRight, 
  FiEye, 
  FiLoader,
  FiPlus,
  FiTag,
  FiMessageSquare,
  FiSettings,
  FiFileText,
  FiStar
} from 'react-icons/fi';
import { FaIndianRupeeSign as FiRuppeeSign } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Dashboard Stats & Recent Orders from API
  useEffect(() => {
    const fetchDashboardInfo = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch dashboard stats
        const dashRes = await ApiInstance.get('/dashboard');
        if (dashRes.data?.success) {
          setDashboardData(dashRes.data.data);
        }

        // 2. Fetch top 5 recent orders
        const ordersRes = await ApiInstance.get('/orders', {
          params: { page: 1, limit: 5 }
        });
        if (ordersRes.data?.success) {
          setRecentOrders(ordersRes.data.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
          <FiLoader className="w-6 h-6 animate-spin" />
          <span>Loading Real-time Analytics...</span>
        </div>
      </div>
    );
  }

  const {
    monthlyNewUsers = 0,
    totalUsers = 0,
    monthlyOrders = 0,
    totalOrders = 0,
    totalProducts = 0,
    monthlyCancelledOrders = 0,
    monthlySalesGraph = [],
    monthlyRevenue = 0,
    todayOrders = 0,
    todayNewUsers = 0,
    todayCancelledOrders = 0,
    todayCancellationPercentage = 0
  } = dashboardData || {};

  // Calculate total yearly revenue from monthly graph
  const yearlyRevenue = monthlySalesGraph.reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
  const yearlyProductsSold = monthlySalesGraph.reduce((acc, curr) => acc + (curr.productsSold || 0), 0);

  // Helper for Order Status Badge
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-[#E8DACD]/50 text-[#1E7741] border-[#E8DACD]';
      case 'shipped':
      case 'out_for_delivery':
      case 'confirmed':
      case 'packed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-[#5F0917]/40 text-[#D96B3B] border-[#5F0917]';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 shadow-sm border border-[#E8DACD]">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Welcome back, Fleur Admin! 👋
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Here is your live e-commerce store overview for <span className="text-gray-900 font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products/add')}
            className="py-2.5 px-4 rounded-2xl bg-[#FAF5EF] text-[#2B1B17] font-black text-xs hover:bg-[#7A0C1E] hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="py-2.5 px-4 rounded-2xl bg-[#7A0C1E] text-white font-black text-xs hover:bg-[#5F0917] transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <FiShoppingBag className="w-4 h-4" />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Monthly Revenue */}
        <div 
          onClick={() => navigate('/orders')}
          className="bg-[#F5E1E3] text-[#7A0C1E] rounded-3xl p-6 shadow-lg shadow-[#F5E1E3]/50 flex items-center justify-between transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#7A0C1E]/10 flex items-center justify-center shrink-0">
              <FiRuppeeSign className="w-7 h-7 text-[#7A0C1E]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#7A0C1E]/80 tracking-wide uppercase">
                Monthly Revenue
              </p>
              <h3 className="text-2xl font-black mt-1 tracking-tight text-[#7A0C1E]">
                ₹{monthlyRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-[11px] font-bold text-[#7A0C1E]/70 block mt-0.5">
                Orders: {monthlyOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Orders */}
        <div 
          onClick={() => navigate('/orders')}
          className="bg-[#FCEAD9] text-[#5F0917] rounded-3xl p-6 shadow-lg shadow-[#FCEAD9]/50 flex items-center justify-between transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5F0917]/10 flex items-center justify-center shrink-0">
              <FiShoppingBag className="w-7 h-7 text-[#5F0917]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#5F0917]/80 tracking-wide uppercase">
                Today's Orders
              </p>
              <h3 className="text-3xl font-black mt-1 tracking-tight text-[#5F0917]">
                {todayOrders}
              </h3>
              <span className="text-[11px] font-bold text-[#5F0917]/70 block mt-0.5">
                Total: {totalOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Today's New Users */}
        <div 
          onClick={() => navigate('/users')}
          className="bg-[#C0E1D2] text-[#4A725E] rounded-3xl p-6 shadow-lg shadow-[#C0E1D2]/30 flex items-center justify-between transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#4A725E]/10 backdrop-blur-md flex items-center justify-center shrink-0">
              <FiUsers className="w-7 h-7 text-[#4A725E]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#4A725E]/80 tracking-wide uppercase">
                Today New Users
              </p>
              <h3 className="text-3xl font-black mt-1 tracking-tight text-[#4A725E]">
                {todayNewUsers}
              </h3>
              <span className="text-[11px] font-bold text-[#4A725E]/70 block mt-0.5">
                Total Users: {totalUsers}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Today's Cancellation Percentage with Count */}
        <div 
          onClick={() => navigate('/orders')}
          className="bg-[#E8DACD] text-[#2B1B17] rounded-3xl p-6 shadow-lg shadow-[#E8DACD]/30 flex items-center justify-between transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2B1B17]/10 backdrop-blur-md flex items-center justify-center shrink-0">
              <FiXCircle className="w-7 h-7 text-[#2B1B17]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#2B1B17]/80 tracking-wide uppercase">
                Today Cancellation
              </p>
              <h3 className="text-3xl font-black mt-1 tracking-tight text-[#2B1B17]">
                {todayCancellationPercentage}%
              </h3>
              <span className="text-[11px] font-bold text-[#2B1B17]/70 block mt-0.5">
                Cancelled Count: {todayCancelledOrders}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): 12-Month Sales Chart */}
        <div className="lg:col-span-8 space-y-8">
          {/* Sales & Revenue Analytics Chart Card */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#E8DACD]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Sales & Revenue Performance
                </h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                  12-month revenue collections & products sold trend.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-black">
                <div className="flex items-center gap-2 bg-[#F2E6DA] px-3 py-1.5 rounded-full text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-[#7A0C1E]" />
                  <span>Revenue (₹)</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F2E6DA] px-3 py-1.5 rounded-full text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-[#E8DACD]" />
                  <span>Products Sold</span>
                </div>
              </div>
            </div>

            {/* Total Revenue Callout Bar */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-[#F2E6DA] border border-[#E8DACD] text-xs">
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Annual Revenue</span>
                <p className="text-xl font-black text-gray-900 mt-0.5">
                  ₹{yearlyRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Annual Products Sold</span>
                <p className="text-xl font-black text-gray-900 mt-0.5">
                  {yearlyProductsSold} Units
                </p>
              </div>
            </div>

            {/* SVG Bar Chart Visualization */}
            <div className="relative w-full h-64 pt-4">
              <div className="h-full flex items-end justify-between gap-2 px-2 pb-6 border-b border-[#E8DACD]">
                {monthlySalesGraph.map((dataItem, index) => {
                  // Max calculation for bar scaling
                  const maxSales = Math.max(...monthlySalesGraph.map((d) => d.totalSales || 1), 100);
                  const barHeightPercent = Math.max(Math.min((dataItem.totalSales / maxSales) * 100, 100), 8);

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                      {/* Hover Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white rounded-xl p-2 text-[10px] font-bold z-20 pointer-events-none shadow-lg text-center whitespace-nowrap">
                        <p>{dataItem.month} {dataItem.year}</p>
                        <p className="text-[#7A0C1E]">₹{dataItem.totalSales.toLocaleString()}</p>
                        <p className="text-[#E8DACD]">{dataItem.productsSold} items</p>
                      </div>

                      {/* Dual Bar */}
                      <div className="w-full flex items-end justify-center gap-1 h-44">
                        <div
                          style={{ height: `${barHeightPercent}%` }}
                          className="w-full max-w-[14px] bg-[#7A0C1E] rounded-t-lg transition-all group-hover:bg-[#FF8585]"
                        />
                        <div
                          style={{ height: `${Math.min((dataItem.productsSold / (yearlyProductsSold || 1)) * 300, 100)}%` }}
                          className="w-full max-w-[10px] bg-[#E8DACD] rounded-t-lg transition-all"
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-gray-400 group-hover:text-gray-900">
                        {dataItem.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Orders List Card */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#E8DACD] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DACD]">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="w-5 h-5 text-[#7A0C1E]" />
                <h3 className="text-base font-black text-gray-900">
                  Recent Orders
                </h3>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="text-xs font-black text-[#7A0C1E] hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F2E6DA] text-gray-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DACD] font-medium text-gray-700">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400 font-bold">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50">
                        <td className="py-3.5 px-4 font-mono font-black text-gray-900">
                          #{ord.order_number || `ORD-${ord.id}`}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-gray-900">
                          {ord.user?.name || 'Guest User'}
                        </td>
                        <td className="py-3.5 px-4 font-black text-gray-900">
                          ₹{parseFloat(ord.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(ord.status)}`}>
                            {ord.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/orders/${ord.id}`)}
                            className="p-2 rounded-xl bg-[#FAF5EF] text-[#2B1B17] hover:bg-[#7A0C1E] transition-all cursor-pointer font-bold text-xs inline-flex items-center gap-1"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Navigation Shortcuts & Admin Summary */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Management Navigation Card */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-[#E8DACD] space-y-5">
            <h3 className="text-base font-black text-gray-900 pb-3 border-b border-[#E8DACD]">
              Quick Management
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/products')}
                className="w-full p-4 rounded-2xl bg-[#F2E6DA] hover:bg-[#FAF5EF] text-gray-800 transition-all flex items-center justify-between font-extrabold text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#7A0C1E]/20 text-[#7A0C1E] group-hover:bg-white">
                    <FiBox className="w-4 h-4" />
                  </div>
                  <span>Products Catalog ({totalProducts})</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/categories')}
                className="w-full p-4 rounded-2xl bg-[#F2E6DA] hover:bg-[#FAF5EF] text-gray-800 transition-all flex items-center justify-between font-extrabold text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#E8DACD]/40 text-[#1E7741] group-hover:bg-white">
                    <FiTag className="w-4 h-4" />
                  </div>
                  <span>Categories Management</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/contact-support')}
                className="w-full p-4 rounded-2xl bg-[#F2E6DA] hover:bg-[#FAF5EF] text-gray-800 transition-all flex items-center justify-between font-extrabold text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-600 group-hover:bg-white">
                    <FiMessageSquare className="w-4 h-4" />
                  </div>
                  <span>Support Messages</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/cms')}
                className="w-full p-4 rounded-2xl bg-[#F2E6DA] hover:bg-[#FAF5EF] text-gray-800 transition-all flex items-center justify-between font-extrabold text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-white">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  <span>CMS Content Pages</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/reviews')}
                className="w-full p-4 rounded-2xl bg-[#F2E6DA] hover:bg-[#FAF5EF] text-gray-800 transition-all flex items-center justify-between font-extrabold text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-white">
                    <FiStar className="w-4 h-4" />
                  </div>
                  <span>Product Reviews</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="w-full p-4 rounded-2xl bg-[#F2E6DA] hover:bg-[#FAF5EF] text-gray-800 transition-all flex items-center justify-between font-extrabold text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-white">
                    <FiSettings className="w-4 h-4" />
                  </div>
                  <span>Store Settings</span>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;