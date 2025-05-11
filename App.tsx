import React, { useEffect, useState } from 'react'
import { useColorScheme, AppState, AppStateStatus, ColorSchemeName } from 'react-native'
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper'
import { DefaultTheme, DarkTheme } from '@react-navigation/native'
import { _COLORS } from './src/consts/Colors'
import { useAppSettingsStore } from './src/store/settingStore'

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
  
  // 根据主题设置和系统颜色方案确定当前主题
  const getThemeBasedOnSettings = (systemScheme: ColorSchemeName): typeof customLightTheme => {
    switch (themeMode) {
      case 'light':
        return customLightTheme
      case 'dark':
        return customDarkTheme
      case 'system':
      default:
        return systemScheme === 'dark' ? customDarkTheme : customLightTheme
    }
  }
  
  const [appTheme, setAppTheme] = useState(getThemeBasedOnSettings(colorScheme))

  // 监听系统主题变化和用户设置变化
  useEffect(() => {
    const updateTheme = (scheme: ColorSchemeName) => {
      // 根据主题设置和系统颜色方案确定当前主题
      const newTheme = getThemeBasedOnSettings(scheme)
      setAppTheme(newTheme)

      // 设置全局变量以便在布局中使用
      const isDark = (themeMode === 'dark') || (themeMode === 'system' && scheme === 'dark')
      global.navigationTheme = isDark ? NavigationDarkTheme : NavigationLightTheme
    }

    // 立即应用当前主题
    updateTheme(colorScheme)

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateTheme(colorScheme)
      }
    })

    return () => {
      subscription.remove()
    }
  // 添加 themeMode 作为依赖项，确保主题设置变化时重新应用主题
  }, [colorScheme, themeMode])

  return (
    <PaperProvider theme={appTheme}>
      <AppLayout />
    </PaperProvider>
  )
}

export default App
