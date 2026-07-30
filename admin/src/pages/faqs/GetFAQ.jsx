import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiHelpCircle, 
  FiEdit2, 
  FiTrash2, 
  FiLoader,
  FiCalendar,
  FiTag,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ApiInstance from '../../utils/ApiInstance';
import ConfirmModal from '../../components/ConfirmModal';

const GetFAQ = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [faq, setFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    isDeleting: false
  });

  useEffect(() => {
    const fetchFaq = async () => {
      setIsLoading(true);
      try {
        const res = await ApiInstance.get(`/faqs/${id}`);
        if (res.data?.success) {
          setFaq(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching FAQ details:', error);
        toast.error('Failed to load FAQ details');
        navigate('/faqs');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFaq();
    }
  }, [id, navigate]);

  const handleDeleteConfirm = async () => {
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const res = await ApiInstance.delete(`/faqs/delete/${id}`);
      if (res.data?.success) {
        toast.success('FAQ deleted successfully');
        navigate('/faqs');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete FAQ');
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 font-black text-[#7A0C1E] text-sm">
          <FiLoader className="w-6 h-6 animate-spin text-[#7A0C1E]" />
          <span>Loading FAQ details...</span>
        </div>
      </div>
    );
  }

  if (!faq) return null;

  const isActive = faq.status === 'active';

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faqs')}
            className="p-2.5 rounded-2xl bg-white border border-[#E8DACD] text-gray-700 hover:bg-[#FAF5EF] hover:text-[#7A0C1E] transition-all cursor-pointer shadow-2xs"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              FAQ Details #{faq.id || faq._id}
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Detailed view of customer FAQ question and answer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/faqs/edit/${faq.id || faq._id}`)}
            className="py-2.5 px-5 rounded-2xl bg-[#7A0C1E] hover:bg-[#5F0917] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.01]"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit FAQ</span>
          </button>

          <button
            onClick={() => setDeleteModalState({ isOpen: true, isDeleting: false })}
            className="py-2.5 px-4 rounded-2xl bg-red-50 text-red-500 font-extrabold text-xs hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main FAQ Detail Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DACD] space-y-6">
        
        {/* Meta Pills Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#E8DACD]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FAF5EF] text-[#7A0C1E] border border-[#E8DACD] flex items-center gap-1.5">
              <FiTag className="w-3.5 h-3.5" />
              <span>{faq.category || 'General'}</span>
            </span>

            <span className="text-xs text-gray-400 font-bold">
              Priority: #{faq.sort_order ?? 0}
            </span>
          </div>

          {isActive ? (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FAF5EF] text-[#5F0917] border border-[#E8DACD] flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4" />
              <span>Active</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-700 flex items-center gap-1.5">
              <FiXCircle className="w-4 h-4" />
              <span>Inactive</span>
            </span>
          )}
        </div>

        {/* Question */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Question</h3>
          <p className="text-lg font-black text-gray-900 leading-snug">
            {faq.question}
          </p>
        </div>

        {/* Answer Box */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Answer</h3>
          <div className="p-6 rounded-2xl bg-[#FAF5EF]/50 border border-[#E8DACD] text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
            {faq.answer}
          </div>
        </div>

        {/* Footer Dates */}
        <div className="pt-4 border-t border-[#E8DACD] flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-gray-400 gap-2">
          <div className="flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5" />
            <span>Created: {formatDate(faq.createdAt || faq.created_at)}</span>
          </div>

          {faq.updatedAt && (
            <div>
              <span>Last Updated: {formatDate(faq.updatedAt || faq.updated_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, isDeleting: false })}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModalState.isDeleting}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ permanently?"
        confirmText="Delete FAQ"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default GetFAQ;