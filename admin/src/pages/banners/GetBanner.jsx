import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiLayers, 
  FiCheckCircle, 
  FiXCircle, 
  FiArrowUpRight,
  FiCalendar,
  FiHash,
  FiExternalLink
} from 'react-icons/fi';

const GetBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const getImageSrc = (imgPath) => {
    if (!imgPath) return 'https://via.placeholder.com/1200x500?text=No+Banner+Image';
    if (imgPath.startsWith('http')) return imgPath;
    return `http://localhost:3131${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res = await ApiInstance.get(`/banners/${id}`);
      if (res.data?.success) {
        setBanner(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching banner details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await ApiInstance.delete(`/banners/delete/${id}`);
      if (res.data?.success) {
        navigate('/banners');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-xs font-bold text-gray-400 animate-pulse max-w-4xl mx-auto">
        Loading banner details...
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-4xl mx-auto">
        <h3 className="text-sm font-black text-gray-800">Banner Not Found</h3>
        <p className="text-xs text-gray-400 mt-1">The banner you requested does not exist or was removed.</p>
        <Link
          to="/banners"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF9D9D] text-[#2D252E] text-xs font-black uppercase"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Banners</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/banners"
          className="inline-flex items-center gap-2 text-xs font-black text-gray-600 hover:text-[#FF9D9D] transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Banners</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/banners/edit/${banner.id}`}
            className="px-4 py-2 rounded-2xl bg-[#FAF5F7] hover:bg-[#EEF8CD] text-gray-800 text-xs font-black flex items-center gap-2 transition-colors"
          >
            <FiEdit className="w-4 h-4 text-[#FF9D9D]" />
            <span>Edit Banner</span>
          </Link>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Preview Card */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 bg-[#FAF5F7] border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiLayers className="w-5 h-5 text-[#FF9D9D]" />
            <h2 className="text-lg font-black text-gray-900">
              Live Banner Preview #{banner.id}
            </h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${
            banner.status === 'active' ? 'bg-[#EEF8CD] text-[#2D252E]' : 'bg-gray-200 text-gray-600'
          }`}>
            {banner.status === 'active' ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
            <span>{banner.status}</span>
          </span>
        </div>

        {/* Live Banner Mockup View */}
        <div className="relative w-full min-h-[320px] bg-gray-900 flex items-center justify-center overflow-hidden">
          <img
            src={getImageSrc(banner.image)}
            alt={banner.title || 'Banner'}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="relative z-10 p-8 max-w-2xl text-center text-white space-y-3">
            {banner.title && (
              <h1 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-md">
                {banner.title}
              </h1>
            )}
            {banner.subtitle && (
              <p className="text-sm font-medium text-gray-200 leading-relaxed drop-shadow">
                {banner.subtitle}
              </p>
            )}
            {banner.button_text && (
              <div className="pt-2">
                <a
                  href={banner.button_link || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF9D9D] text-[#2D252E] font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
                >
                  <span>{banner.button_text}</span>
                  <FiArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Banner Metadata & Field Values */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Banner Title</span>
              <p className="text-sm font-bold text-gray-900 mt-1">{banner.title || 'None'}</p>
            </div>

            <div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Subtitle</span>
              <p className="text-xs font-semibold text-gray-600 mt-1 leading-relaxed">{banner.subtitle || 'None'}</p>
            </div>

            <div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">Button CTA & Link</span>
              {banner.button_text || banner.button_link ? (
                <div className="mt-1 space-y-1">
                  <p className="text-xs font-bold text-gray-800">{banner.button_text || 'No Label'}</p>
                  {banner.button_link && (
                    <a
                      href={banner.button_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#FF9D9D] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span className="truncate max-w-sm">{banner.button_link}</span>
                      <FiExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">No call to action specified</p>
              )}
            </div>
          </div>

          <div className="space-y-4 border-l border-gray-100 pl-0 md:pl-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FAF5F7] text-[#FF9D9D] flex items-center justify-center font-black">
                <FiHash className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Display Sort Order</span>
                <span className="text-xs font-black text-gray-800">Priority #{banner.display_order ?? 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FAF5F7] text-gray-600 flex items-center justify-center font-black">
                <FiCalendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Created Date</span>
                <span className="text-xs font-semibold text-gray-800">
                  {banner.createdAt ? new Date(banner.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FAF5F7] text-gray-600 flex items-center justify-center font-black">
                <FiCalendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Last Updated</span>
                <span className="text-xs font-semibold text-gray-800">
                  {banner.updatedAt ? new Date(banner.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to permanently delete banner "${banner.title || 'Untitled'}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />
    </div>
  );
};

export default GetBanner;
