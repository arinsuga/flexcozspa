import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
          }
          set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      // partially persist if needed, or persist all
    }
  )
);
