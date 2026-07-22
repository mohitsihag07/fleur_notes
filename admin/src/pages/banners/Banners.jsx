import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  FiPlus, 
  FiSearch, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiImage, 
  FiExternalLink, 
  FiCheckCircle, 
  FiXCircle,
  FiArrowUpRight,
  FiSliders,
  FiLayers
} from 'react-icons/fi';

const Banners = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    homeBanners: 0,
    otherBanners: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  // Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [bannerToToggle, setBannerToToggle] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim(),
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const res = await ApiInstance.get('/banners', { params });
      if (res.data?.success) {
        const payload = res.data.data;
        setBanners(payload?.banners || []);
        if (payload?.meta) {
          setTotalPages(payload.meta.totalPages || 1);
          setTotalItems(payload.meta.totalItems || 0);
          if (payload.meta.stats) {
            setStats(payload.meta.stats);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBanners();
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      const res = await ApiInstance.delete(`/banners/delete/${bannerToDelete.id}`);
      if (res.data?.success) {
        setDeleteModalOpen(false);
        setBannerToDelete(null);
        fetchBanners();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!bannerToToggle) return;
    try {
      const res = await ApiInstance.put(`/banners/update-status/${bannerToToggle.id}`);
      if (res.data?.success) {
        setStatusModalOpen(false);
        setBannerToToggle(null);
        fetchBanners();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getImageSrc = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/800x400?text=No+Banner+Image';
    if (imgPath.startsWith('http')) return imgPath;
    return `http://localhost:3131${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  const renderBannerSection = (title, typeValue) => {
    const filtered = banners.filter((b) => (b.type || 'home') === typeValue);
    if (filtered.length === 0) return null;

    return (
      <div className="space-y-4 pt-6">
        {/* Section Heading & Elegant Line */}
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-black text-[#7A0C1E] uppercase tracking-widest whitespace-nowrap bg-[#FAF5EF] px-3.5 py-2 rounded-full border border-[#E8DACD] shadow-2xs">
            {title} ({filtered.length})
          </h3>
          <div className="h-[1px] w-full bg-[#E8DACD]"></div>
        </div>

        {/* 4 in a row grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-[#E8DACD] overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              {/* Banner Image Preview Container */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                <img
                  src={getImageSrc(b.image)}
                  alt={b.title || 'Banner'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Banner+Image';
                  }}
                />
                
                {/* Status & Type Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <button
                    onClick={() => {
                      setBannerToToggle(b);
                      setStatusModalOpen(true);
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer ${
                      b.status === 'active'
                        ? 'bg-[#FAF5EF] text-[#2B1B17]'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {b.status === 'active' ? (
                      <FiCheckCircle className="w-3 h-3 text-[#2B1B17]" />
                    ) : (
                      <FiXCircle className="w-3 h-3 text-gray-500" />
                    )}
                    <span>{b.status}</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#F2E6DA] border border-[#7A0C1E]/30 text-[#2B1B17] shadow-sm">
                    {b.type || 'home'}
                  </span>
                </div>

                {/* Display Order Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-black">
                  Order: #{b.display_order ?? 0}
                </div>
              </div>

              {/* Banner Details Body */}
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 tracking-tight line-clamp-1">
                    {b.title || 'Untitled Banner'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Target Page:</span>
                    <span className="text-[9px] font-black uppercase bg-[#FAF5EF] text-[#7A0C1E] px-2 py-0.5 rounded-full border border-[#E8DACD]">
                      {b.type || 'home'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Banner Actions Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-[#E8DACD] flex items-center justify-between">
                <span className="text-[10px] font-medium text-gray-400">
                  ID: #{b.id}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/banners/${b.id}`)}
                    className="p-2 rounded-xl text-gray-500 hover:bg-[#FAF5EF] hover:text-[#2B1B17] transition-colors cursor-pointer"
                    title="View Banner Details"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate(`/banners/edit/${b.id}`)}
                    className="p-2 rounded-xl text-gray-500 hover:bg-[#F2E6DA] hover:text-[#7A0C1E] transition-colors cursor-pointer"
                    title="Edit Banner"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setBannerToDelete(b);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Banner"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Section */}
      <div className="bg-[#F2E6DA] rounded-3xl p-6 border border-[#E8DACD] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiLayers className="w-6 h-6 text-[#7A0C1E]" />
            <span>Hero Banners & Promotions</span>
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Manage store homepage sliders, promo graphics, and call-to-action banners.
          </p>
        </div>
        <Link
          to="/banners/add"
          className="px-5 py-3 rounded-2xl bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all hover:scale-105"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Banner</span>
        </Link>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Banners */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Banners</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalBanners}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
            <FiImage className="w-5 h-5" />
          </div>
        </div>

        {/* Active Banners */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Banners</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activeBanners}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-[#E8DACD]/50 text-[#1E7741]">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Home/Hero Banners */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Home/Hero Banners</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.homeBanners}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <FiArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Other Pages Banners */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8DACD] flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Other Page Banners</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.otherBanners}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <FiLayers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#E8DACD] flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search banner title..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#F2E6DA] rounded-full text-xs font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A0C1E]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-[#F2E6DA] px-3 py-1.5 rounded-full">
            <FiSliders className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-black text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-black text-gray-800 border-none focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <span className="text-xs font-black text-gray-400 px-3 py-1 bg-[#FAF5EF] text-[#2B1B17] rounded-full">
            {totalItems} Banners
          </span>
        </div>
      </div>

      {/* Banners Grouped Sections */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs font-bold text-gray-400 animate-pulse">
          Loading promotional banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DACD]">
          <FiImage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-black text-gray-800">No Banners Found</h3>
          <p className="text-xs text-gray-400 mt-1">Get started by adding your first promotional banner.</p>
          <Link
            to="/banners/add"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7A0C1E] text-white text-xs font-black uppercase"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Banner</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-8 divide-y divide-[#E8DACD]/60">
          {renderBannerSection('Home Banner', 'home')}
          {renderBannerSection('Shop Banner', 'shop')}
          {renderBannerSection('Categories Banner', 'categories')}
          {renderBannerSection('About Us Banner', 'about')}
          {renderBannerSection('Contact Us Banner', 'contact')}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-full bg-white border border-[#E8DACD] text-xs font-black text-gray-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-black text-gray-600 px-3">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-full bg-white border border-[#E8DACD] text-xs font-black text-gray-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete banner "${bannerToDelete?.title || 'Untitled'}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />

      {/* Toggle Status Modal */}
      <ConfirmModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title="Toggle Status"
        message={`Are you sure you want to change status to ${
          bannerToToggle?.status === 'active' ? 'Inactive' : 'Active'
        }?`}
        confirmText="Confirm Change"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Banners;
