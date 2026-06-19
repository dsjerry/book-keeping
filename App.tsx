import React, { useEffect, useMemo } from 'react'
import { useColorScheme, AppState, AppStateStatus } from 'react-native'
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper'
import { DefaultTheme, DarkTheme, Theme } from '@react-navigation/native'
import { _COLORS } from './src/consts/Colors'
import { useAppSettingsStore } from './src/store/settingStore'
import { NavigationThemeProvider } from './src/contexts/NavigationThemeContext'
import ErrorBoundary from './src/components/ErrorBoundary'

import AppLayout from './src/layouts'

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
  },
}

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
  },
}

// 定义导航主题
const NavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: _COLORS.sub,
    // 可以在这里自定义导航浅色主题颜色
  },
}

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    // 可以在这里自定义导航深色主题颜色
  },
}

function App(): React.JSX.Element {
  // 获取系统颜色方案
  const colorScheme = useColorScheme()
  // 获取用户主题设置
  const { themeMode } = useAppSettingsStore()
  
  const isDark = (themeMode === 'dark') || (themeMode === 'system' && colorScheme === 'dark')
  
  const appTheme = useMemo(() => {
    switch (themeMode) {
      case 'light':
        return customLightTheme
      case 'dark':
        return customDarkTheme
      case 'system':
      default:
        return colorScheme === 'dark' ? customDarkTheme : customLightTheme
    }
  }, [colorScheme, themeMode])

  const navigationTheme = useMemo<Theme>(
    () => (isDark ? NavigationDarkTheme : NavigationLightTheme),
    [isDark]
  )

  // 监听系统主题变化（App 从后台恢复时重新检测）
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // 系统主题变化时 useColorScheme 会自动更新，无需额外处理
    })

    return () => {
      subscription.remove()
    }
  }, [])

  return (
    <PaperProvider theme={appTheme}>
      <ErrorBoundary>
        <NavigationThemeProvider theme={navigationTheme}>
          <AppLayout />
        </NavigationThemeProvider>
      </ErrorBoundary>
    </PaperProvider>
  )
}

export default App
