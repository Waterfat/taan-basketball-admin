import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User | null, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  getRefreshToken: () => string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken });
  },

  setAccessToken: (token) => set({ accessToken: token }),

  getRefreshToken: () => localStorage.getItem('refreshToken'),

  logout: () => {
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null });
  },
}));
