import { createContext, useContext } from 'react'
import { DefaultTheme, Theme } from '@react-navigation/native'

const NavigationThemeContext = createContext<Theme>(DefaultTheme)

export const NavigationThemeProvider: React.FC<{
  theme: Theme
  children: React.ReactNode
}> = ({ theme, children }) => {
  return (
    <NavigationThemeContext.Provider value={theme}>
      {children}
    </NavigationThemeContext.Provider>
  )
}

export const useNavigationTheme = () => {
  return useContext(NavigationThemeContext)
}
