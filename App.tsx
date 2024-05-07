import React from 'react'
import { PaperProvider } from 'react-native-paper'

import AppLayout from './src/layouts'

function App(): React.JSX.Element {
  return (
    <PaperProvider>
      <AppLayout />
    </PaperProvider>
  )
}

export default App
