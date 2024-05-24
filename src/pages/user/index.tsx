import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import UserScreen from './UserScreen'
import LoginScreen from './LoginScreen'
import ProfileEditScreen from './ProfileEdit'
import AddTagsScreen from './AddTagsScreen'
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
          options={{ title: '个人中心' }}
          component={UserScreen}></Stack.Screen>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ title: '登录' }}></Stack.Screen>
        <Stack.Screen
          name="ProfileEditScreen"
          component={ProfileEditScreen}
          options={{ title: '编辑信息' }}></Stack.Screen>
        <Stack.Screen
          name="AddTagsScreen"
          component={AddTagsScreen}
          options={{ title: '添加标签' }}></Stack.Screen>
      </Stack.Navigator>
    </UserProvider>
  )
}

export default User
