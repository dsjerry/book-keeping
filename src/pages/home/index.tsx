import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AddingScreen from './AddingScreen'
import HomeScreen from './HomeScreen'
import AddressList from './AddressList'

import { HomeProvider } from './contexts/HomeContext'

const RootStack = createStackNavigator()

export default function Home() {
  const insets = useSafeAreaInsets()
  return (
    <HomeProvider>
      <RootStack.Navigator initialRouteName="HomeScreen">
        <RootStack.Group screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="HomeScreen" component={HomeScreen} />
          <RootStack.Screen name="AddressDetailScreen" component={AddressList} />
        </RootStack.Group>
        <RootStack.Group
          screenOptions={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: {
              marginTop: 40 + insets.top,
              borderRadius: 10,
            },
          }}>
          <RootStack.Screen name="Adding" component={AddingScreen} />
        </RootStack.Group>
      </RootStack.Navigator>
    </HomeProvider>
  )
}
