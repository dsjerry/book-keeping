import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import User from '~pages/user'
import AddingScreen from './AddingScreen'
import DetailScreen from './DetailScreen'
import HomeScreen from './HomeScreen'
import HalfModal from '~components/HalfModal'
import { HomeProvider } from './contexts/HomeContext'

const RootStack = createStackNavigator()

export default function Home() {
  return (
    <HomeProvider>
      <RootStack.Navigator>
        <RootStack.Group screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="HomeScreen" component={HomeScreen} />
          <RootStack.Screen name="DetailScreen" component={DetailScreen} />
          <RootStack.Screen name="User" component={User} />
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
          <RootStack.Screen
            name="Adding"
            component={AddingScreen}
            options={{}}
          />
        </RootStack.Group>
        <RootStack.Group
          screenOptions={{
            presentation: 'modal',
            headerShown: false,
            cardStyle: {
              marginTop: 500,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          }}>
          <RootStack.Screen
            name="HalfModal"
            component={HalfModal}
            options={{}}
          />
        </RootStack.Group>
      </RootStack.Navigator>
    </HomeProvider>
  )
}
