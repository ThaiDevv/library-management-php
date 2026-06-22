import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  sub: string; // MaNV
  role: 'Admin' | 'Staff' | 'NHANVIEN' | 'ADMIN'; // Including possible backend values
  // add other fields if necessary
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token); // explicit sync just in case
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
