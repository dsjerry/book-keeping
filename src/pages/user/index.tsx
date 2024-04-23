import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import UserHome from './UserHome'
import LoginPane from './Login'

const Stack = createStackNavigator()

const User = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login">
      <Stack.Screen name="UserHome" component={UserHome}></Stack.Screen>
      <Stack.Screen name="Login" component={LoginPane}></Stack.Screen>
    </Stack.Navigator>
  )
}

export default User
