import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CMSAuthStore {
  password: string;
  isAuthenticated: boolean;
  login: (inputPassword: string) => boolean;
  logout: () => void;
  updatePassword: (newPassword: string) => void;
}

export const useCMSAuthStore = create<CMSAuthStore>()(
  persist(
    (set, get) => ({
      password: '9818535499',
      isAuthenticated: false,
      
      login: (inputPassword: string) => {
        const isValid = inputPassword === get().password;
        set({ isAuthenticated: isValid });
        return isValid;
      },
      
      logout: () => set({ isAuthenticated: false }),
      
      updatePassword: (newPassword: string) => set({ password: newPassword }),
    }),
    {
      name: 'cms-auth',
    }
  )
);
