import { create } from 'zustand';

const useDialogStore = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: 'info', // 'info', 'warning', 'confirm', 'success'
  onConfirm: null,
  onCancel: null,

  showAlert: (title, message, type = 'info') => {
    set({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => set({ isOpen: false }),
      onCancel: null
    });
  },

  showConfirm: (title, message, onConfirm, onCancel = null) => {
    set({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm: () => {
        set((state) => {
          if (!state.isOpen) return {};
          if (onConfirm) {
            setTimeout(() => onConfirm(), 0);
          }
          return { isOpen: false, onConfirm: null };
        });
      },
      onCancel: () => {
        set((state) => {
          if (!state.isOpen) return {};
          if (onCancel) {
            setTimeout(() => onCancel(), 0);
          }
          return { isOpen: false, onCancel: null };
        });
      }
    });
  },

  closeDialog: () => {
    set({ isOpen: false });
  }
}));

export default useDialogStore;
