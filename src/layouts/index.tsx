import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import {
  createDrawerNavigator,
  DrawerItemList,
  DrawerContentScrollView,
} from '@react-navigation/drawer'
import { Icon } from 'react-native-paper'

import DrawerItemUser from '~components/DrawerItemUser'
import DrawerItemBottom from '~components/DrawerItemBottom'
import Home from '~pages/home'
import Settings from '~pages/settings'
import Analyze from '~pages/analyze'
import Header from './Header'
import { HeaderProvider } from '../contexts/HeaderContext'

const Drawer = createDrawerNavigator()

const HomeIcon = () => <Icon source="home" size={24} color={'#6d57a7'} />
const AnalyzeIcon = () => (
  <Icon source="chart-bar-stacked" size={24} color={'#6d57a7'} />
)

const SettingsIcon = () => (
  <Icon source="cog-outline" size={24} color={'#6d57a7'} />
)

// 自定义Drawer，使得Drawer.Navigator 里面除了可以使用 Drawer.Screen，还可以添加其他项目
const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <DrawerItemUser />
      {/* 也可以使用 DrawerItem 循环 */}
      <DrawerItemList {...props} />
      <DrawerItemBottom style={{ marginTop: 'auto' }} />
    </DrawerContentScrollView>
  )
}

export default function AppLayout() {
  return (
    <NavigationContainer>
      {/* drawerContent 会完全覆盖 Drawer.Screen 的渲染 */}
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 16,
          },
          drawerActiveBackgroundColor: '#e7e0ec',
          drawerLabelStyle: {
            color: '#6d57a7',
            marginLeft: -10,
          },
          header: props => (
            <HeaderProvider>
              <Header {...props} />
            </HeaderProvider>
          ),
        }}>
        <Drawer.Screen
          name="Home"
          component={Home}
          options={{
            drawerIcon: () => <HomeIcon />,
            title: '首页',
          }}
        />
        <Drawer.Screen
          name="Analyze"
          component={Analyze}
          options={{ drawerIcon: () => <AnalyzeIcon />, title: '分析' }}
        />
        <Drawer.Screen
          name="Settings"
          component={Settings}
          options={{ drawerIcon: () => <SettingsIcon />, title: '设置' }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  )
}
