import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import UserScreen from './UserScreen'
import LoginScreen from './LoginScreen'
import { UserProvider } from './contexts/UserContext'

const Stack = createStackNavigator()

const User = () => {
  return (
    <UserProvider>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="UserHomeScreen">
        <Stack.Screen
          name="UserHomeScreen"
          component={UserScreen}></Stack.Screen>
        <Stack.Screen name="LoginScreen" component={LoginScreen}></Stack.Screen>
      </Stack.Navigator>
    </UserProvider>
  )
}

export default User
