import { create } from 'zustand';

interface AuthState {
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUserId: 'current-user',
  setCurrentUserId: (id) => set({ currentUserId: id }),
}));

export const useCurrentUserId = () => useAuthStore((state) => state.currentUserId);
