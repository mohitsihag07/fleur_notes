import React from 'react';
import { FiAlertTriangle, FiLogOut, FiTrash2, FiX } from 'react-icons/fi';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'logout' | 'warning'
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'logout':
        return (
          <div className="w-14 h-14 rounded-2xl bg-[#FF9D9D]/20 text-[#2D252E] flex items-center justify-center shrink-0 shadow-sm">
            <FiLogOut className="w-7 h-7 text-[#F57070]" />
          </div>
        );
      case 'danger':
        return (
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center shrink-0 shadow-sm">
            <FiTrash2 className="w-7 h-7" />
          </div>
        );
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
            <FiAlertTriangle className="w-7 h-7" />
          </div>
        );
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'logout':
        return 'bg-[#FF9D9D] hover:bg-[#FFC5AA] text-[#2D252E] shadow-md shadow-[#FF9D9D]/20';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20';
      default:
        return 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative space-y-6 transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Modal Body */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {renderIcon()}

          <div className="space-y-1.5 px-2">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-3 px-5 rounded-2xl bg-[#FAF5F7] font-black text-xs text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs transition-all cursor-pointer disabled:opacity-50 ${getConfirmButtonStyle()}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
