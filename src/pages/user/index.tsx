import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import UserScreen from './UserScreen'
import LoginScreen from './LoginScreen'

const Stack = createStackNavigator()

const User = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login">
      <Stack.Screen name="UserHome" component={UserScreen}></Stack.Screen>
      <Stack.Screen name="Login" component={LoginScreen}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default User
