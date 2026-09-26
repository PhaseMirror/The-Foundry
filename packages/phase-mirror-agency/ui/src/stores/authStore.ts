import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { api } from '../api/client';
import type { LoginResponse } from '../types';

interface AuthState {
  token: string | null;
  user: { id: number; username: string; role: string } | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: localStorage.getItem('agency_token'),
        user: null,
        loading: false,
        error: null,
        login: async (username, password) => {
          set({ loading: true, error: null });
          try {
            const response = await api.auth.login({ username, password });
            localStorage.setItem('agency_token', response.token);
            set({ token: response.token, user: response.user, loading: false });
          } catch (err: any) {
            set({ error: err.detail || 'Login failed', loading: false });
            throw err;
          }
        },
        logout: () => {
          localStorage.removeItem('agency_token');
          set({ token: null, user: null, error: null });
        },
      }),
      {
        name: 'agency-auth-store',
        partialize: (state) => ({ token: state.token, user: state.user }),
      }
    ),
    { name: 'AuthStore' }
  )
);
