import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAppSettingsStore = create<AppSettingStore>()(
  persist(
    (set, get) => ({
      useOnline: false,
      confirmExitEdit: false,
      confirmRemove: true,
      themeMode: 'system', // 'system', 'light', 'dark'
      toggleUseOnline: () => set({ useOnline: !get().useOnline }),
      toggleConfirmExitEdit: () => {
        return set({ confirmExitEdit: !get().confirmExitEdit })
      },
      toggleConfirmRemove: () => set({ confirmRemove: !get().confirmRemove }),
      setThemeMode: (mode: 'system' | 'light' | 'dark') => set({ themeMode: mode }),
    }),
    {
      name: 'app-settings',
      partialize: state => ({
        useOnline: state.useOnline,
        confirmExitEdit: state.confirmExitEdit,
        confirmRemove: state.confirmRemove,
        themeMode: state.themeMode,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

interface AppSettingStore extends AppSettings {
  toggleUseOnline: () => void
  toggleConfirmExitEdit: () => void
  toggleConfirmRemove: () => void
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void
}

interface AppSettings {
  useOnline: boolean
  confirmExitEdit: boolean
  confirmRemove: boolean
  themeMode: 'system' | 'light' | 'dark'
}
