import React from 'react'
import { PaperProvider, MD3LightTheme } from 'react-native-paper'

import AppLayout from './src/layouts'

/**
 * TODO 暂时只启用浅色皮肤
 */

function App(): React.JSX.Element {
  return (
    <PaperProvider theme={MD3LightTheme}>
      <AppLayout />
    </PaperProvider>
  )
}

export default App
