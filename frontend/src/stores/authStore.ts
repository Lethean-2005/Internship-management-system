import { create } from 'zustand';
import i18n from '../i18n';
import type { User } from '../types/auth';

function loadUserLanguage(userId: number) {
  const lang = localStorage.getItem(`language_${userId}`) || localStorage.getItem('language') || 'en';
  i18n.changeLanguage(lang);
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    loadUserLanguage(user.id);
    set({ user, token });
  },

  setUser: (user) => {
    loadUserLanguage(user.id);
    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    i18n.changeLanguage(localStorage.getItem('language') || 'en');
    set({ user: null, token: null });
  },
}));
