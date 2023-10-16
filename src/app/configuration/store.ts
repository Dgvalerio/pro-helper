import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigurationStore {
  token: string;
  setToken(token: string): void;
}

export const useConfigurationStore = create<ConfigurationStore>()(
  persist(
    (set) => ({
      token: '',
      setToken: (newToken): void => set({ token: newToken }),
    }),
    { name: 'pro-helper:configuration-store' }
  )
);
