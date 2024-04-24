import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createDrawerNavigator } from '@react-navigation/drawer'
import Icon from 'react-native-vector-icons/AntDesign'

import Home from './src/pages/home'
import Settings from './src/pages/settings'
import Analyze from './src/pages/analyze'
import User from './src/pages/user'

const Drawer = createDrawerNavigator()

const HomeIcon = () => <Icon name="home" size={24} color={'#6d57a7'} />
const AnalyzeIcon = () => <Icon name="barschart" size={24} color={'#6d57a7'} />
const SettingsIcon = () => <Icon name="setting" size={24} color={'#6d57a7'} />
const UserIcon = () => <Icon name="user" size={24} color={'#6d57a7'} />

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 16,
          },
          drawerActiveBackgroundColor: '#e7e0ec',
          drawerLabelStyle: {
            color: '#6d57a7',
          },
        }}>
        <Drawer.Screen
          name="首页"
          component={Home}
          options={{ drawerIcon: () => <HomeIcon /> }}
        />
        <Drawer.Screen
          name="分析"
          component={Analyze}
          options={{ drawerIcon: () => <AnalyzeIcon /> }}
        />
        <Drawer.Screen
          name="设置"
          component={Settings}
          options={{ drawerIcon: () => <SettingsIcon /> }}
        />
        <Drawer.Screen
          name="用户"
          component={User}
          options={{ drawerIcon: () => <UserIcon /> }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  )
}

export default App
