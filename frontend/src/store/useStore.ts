import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Wallet, Portfolio } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

interface DataState {
  wallet: Wallet | null;
  portfolio: Portfolio | null;
  setWallet: (wallet: Wallet) => void;
  setPortfolio: (portfolio: Portfolio) => void;
}

type Store = AuthState & UIState & DataState;

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // ─── Auth ─────────────────────────────────────────────────────────────
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('xc_access_token', accessToken);
          localStorage.setItem('xc_refresh_token', refreshToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('xc_access_token');
          localStorage.removeItem('xc_refresh_token');
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, portfolio: null, wallet: null });
      },

      // ─── UI ───────────────────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ─── App Data ─────────────────────────────────────────────────────────
      wallet: null,
      portfolio: null,
      setWallet: (wallet) => set({ wallet }),
      setPortfolio: (portfolio) => set({ portfolio }),
    }),
    {
      name: 'xcapital-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
