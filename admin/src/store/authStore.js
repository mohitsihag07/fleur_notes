import { create } from 'zustand';
import ApiInstance from '../utils/ApiInstance';

// Always enforce light theme across the application
const enforceLightTheme = () => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'dark-theme');
  root.classList.add('light-theme');
  localStorage.removeItem('fleur_notes_theme');
};

// Immediately enforce light theme on store load
enforceLightTheme();

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSidebarOpen: true,

  // Toggle Sidebar Open / Collapsed
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  // Update user state
  setUser: (user) => set({ user }),

  // Initialize store and check for active tokens
  initialize: async () => {
    enforceLightTheme();

    const token = localStorage.getItem('fleur_notes_admin_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await ApiInstance.get('/verify-session');
      if (response.data.success) {
        set({ user: response.data.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Session initialization failed:', error);
      localStorage.removeItem('fleur_notes_admin_token');
      localStorage.removeItem('fleur_notes_admin_refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Perform admin login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const response = await ApiInstance.post('/login', { email, password, timezone: userTimezone });
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('fleur_notes_admin_token', token);
        localStorage.setItem('fleur_notes_admin_refresh_token', token);

        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true, message: response.data.message || 'Login successful. Welcome back!' };
      }
    } catch (error) {
      set({ isLoading: false });
      const errMsg = error.response?.data?.message || 'Login failed. Verify credentials.';

      return {
        success: false,
        message: errMsg
      };
    }
  },

  // Perform logout
  logout: () => {
    localStorage.removeItem('fleur_notes_admin_token');
    localStorage.removeItem('fleur_notes_admin_refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  }
}));

// Listen to custom api instance events for quick sign out
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;
