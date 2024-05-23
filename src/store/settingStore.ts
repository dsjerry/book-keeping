import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useAppSettingsStore = create<AppSettingStore>()(
  persist(
    (set, get) => ({
      useOnline: false,
      confirmExitEdit: false,
      confirmRemove: true,
      toggleUseOnline: () => set({ useOnline: !get().useOnline }),
      toggleConfirmExitEdit: () => {
        return set({ confirmExitEdit: !get().confirmExitEdit })
      },
      toggleConfirmRemove: () => set({ confirmRemove: !get().confirmRemove }),
    }),
    {
      name: 'app-settings',
      partialize: state => ({
        useOnline: state.useOnline,
        confirmExitEdit: state.confirmExitEdit,
        confirmRemove: state.confirmRemove,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

interface AppSettingStore extends AppSettings {
  toggleUseOnline: () => void
  toggleConfirmExitEdit: () => void
  toggleConfirmRemove: () => void
}
