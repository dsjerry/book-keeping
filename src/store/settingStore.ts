import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAppSettingsStore = create<AppSettingStore>()(
  persist(
    (set, get) => ({
      useOnline: false,
      toggleUseOnline: () => set({ useOnline: !get().useOnline }),
    }),
    {
      name: 'app-settings',
      partialize: state => ({ useOnline: state.useOnline }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

interface AppSettingStore extends AppSettings {
  toggleUseOnline: () => void
}
