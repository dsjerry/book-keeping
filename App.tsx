import React, { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper'
import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native'
import { _COLORS } from './src/consts/Colors'
import { useAppSettingsStore } from './src/store/settingStore'
import { NavigationThemeProvider } from './src/contexts/NavigationThemeContext'
import ErrorBoundary from './src/components/ErrorBoundary'

import AppLayout from './src/layouts'

// 定义导航主题
const NavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: _COLORS.sub,
  },
}

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
  },
}

function App(): React.JSX.Element {
  // 获取系统颜色方案
  const colorScheme = useColorScheme()
  // 获取用户主题设置
  const { themeMode } = useAppSettingsStore()

  // system 模式跟随系统，light / dark 强制指定
  const isDark = useMemo(
    () =>
      themeMode === 'dark' || (themeMode === 'system' && colorScheme === 'dark'),
    [themeMode, colorScheme],
  )

  const navigationTheme = useMemo<Theme>(
    () => (isDark ? NavigationDarkTheme : NavigationLightTheme),
    [isDark],
  )

  return (
    <PaperProvider theme={isDark ? MD3DarkTheme : MD3LightTheme}>
      <ErrorBoundary>
        <NavigationThemeProvider theme={navigationTheme}>
          <AppLayout />
        </NavigationThemeProvider>
      </ErrorBoundary>
    </PaperProvider>
  )
}

export default App
