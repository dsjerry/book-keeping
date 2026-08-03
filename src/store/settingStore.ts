import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logging } from '~utils'

export const useAppSettingsStore = create<AppSettingStore>()(
  persist(
    (set, get) => ({
      useOnline: false,
      confirmExitEdit: false,
      confirmRemove: true,
      useBiometrics: false, // 是否启用生物识别
      themeMode: 'system', // 'system', 'light', 'dark'
      monthlyBudget: 0,
      deepseekApiKey: '',
      deepseekModel: 'deepseek-v4-flash',
      toggleUseOnline: () => {
        const useOnline = !get().useOnline
        logging.info('[同步状态]', useOnline ? '启用' : '禁用')
        set({ useOnline })
      },
      toggleConfirmExitEdit: () => {
        return set({ confirmExitEdit: !get().confirmExitEdit })
      },
      toggleConfirmRemove: () => set({ confirmRemove: !get().confirmRemove }),
      toggleUseBiometrics: () => {
        const useBiometrics = !get().useBiometrics
        logging.info('[生物识别]', useBiometrics ? '启用' : '禁用')
        set({ useBiometrics })
      },
      setThemeMode: (mode: 'system' | 'light' | 'dark') => set({ themeMode: mode }),
      setMonthlyBudget: (budget: number) => set({ monthlyBudget: budget }),
      setDeepseekApiKey: (key: string) => set({ deepseekApiKey: key }),
      setDeepseekModel: (model: string) => set({ deepseekModel: model }),
    }),
    {
      name: 'app-settings',
      partialize: state => ({
        useOnline: state.useOnline,
        confirmExitEdit: state.confirmExitEdit,
        confirmRemove: state.confirmRemove,
        useBiometrics: state.useBiometrics,
        themeMode: state.themeMode,
        monthlyBudget: state.monthlyBudget,
        deepseekApiKey: state.deepseekApiKey,
        deepseekModel: state.deepseekModel,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

interface AppSettingStore extends AppSettings {
  toggleUseOnline: () => void
  toggleConfirmExitEdit: () => void
  toggleConfirmRemove: () => void
  toggleUseBiometrics: () => void
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void
  setMonthlyBudget: (budget: number) => void
  setDeepseekApiKey: (key: string) => void
  setDeepseekModel: (model: string) => void
}
