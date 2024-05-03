import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Adding from '../adding'
import DetailScreen from './DetailScreen'
import HomeScreen from './HomeScreen'
import { HomeProvider } from './contexts/HomeContext'

const RootStack = createStackNavigator()

export default function Home() {
  return (
    <HomeProvider>
      <RootStack.Navigator>
        <RootStack.Group screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Home" component={HomeScreen} />
          <RootStack.Screen name="Detail" component={DetailScreen} />
        </RootStack.Group>
        <RootStack.Group
          screenOptions={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: {
              marginTop: 40,
              borderRadius: 10,
            },
          }}>
          <RootStack.Screen name="Adding" component={Adding} />
        </RootStack.Group>
      </RootStack.Navigator>
    </HomeProvider>
  )
}
