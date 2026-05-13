import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  role: 'admin' | 'operator' | 'viewer';
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('parkflow_token', token);
          localStorage.setItem('parkflow_user', JSON.stringify(user));
        }
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('parkflow_token');
          localStorage.removeItem('parkflow_user');
        }
        set({ user: null, token: null });
      },
      refreshUser: async () => {
        const token = get().token;
        if (!token) return;
        try {
          // Fetch fresh user data from /auth/me
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const response = await fetch(`${baseUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const fresh = await response.json();
            if (typeof window !== 'undefined') {
              localStorage.setItem('parkflow_user', JSON.stringify(fresh));
            }
            set({ user: fresh });
          }
        } catch (e) {
          console.error('Failed to refresh user', e);
        }
      },
    }),
    { name: 'parkflow-auth' }
  )
);

export function canAccess(role: string | undefined, required: string[]): boolean {
  if (!role) return false;
  return required.includes(role);
}
