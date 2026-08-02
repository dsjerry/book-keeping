import { useState } from 'react'
import { View } from 'react-native'
import { NavigationContainer, useNavigation, useNavigationState } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Drawer } from 'react-native-drawer-layout'
import { List, useTheme } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Home from '~pages/home'
import Settings from '~pages/settings'
import Analyze from '~pages/analyze'
import Header from './Header'
import DetailScreen from '~pages/home/DetailScreen'
import UserScreen from '~pages/user'
import DrawerItemUser from '~components/DrawerItemUser'
import DrawerItemBottom from '~components/DrawerItemBottom'
import AuthGuard from '~components/AuthGuard'
import { HomeColorIcon, AnalyzeColorIcon, SettingsColorIcon } from '~components/DrawerIcons'
import { CustomHeaderWithTitle } from './widgets'

import { HeaderProvider } from '../contexts/HeaderContext'
import { useNavigationTheme } from '../contexts/NavigationThemeContext'

const RootStack = createStackNavigator()

const routeNameToTarget: Record<string, string> = {
  Home: 'HomeScreen',
  AnalyzeScreen: 'AnalyzeScreen',
  SettingsScreen: 'SettingsScreen',
}

interface DrawerContent {
  toggleDrawer: () => void
}

const CustomDrawerContent: React.FC<DrawerContent> = ({ toggleDrawer }) => {
  const navigation = useNavigation()
  const theme = useTheme() // 获取当前主题
  const currentRouteName = useNavigationState(state => state?.routes?.[state?.index ?? 0]?.name ?? '')
  const currentTarget = routeNameToTarget[currentRouteName] ?? ''

  const list = [
    {
      title: '首页',
      target: 'HomeScreen',
      icon: <HomeColorIcon />,
    },
    {
      title: '分析',
      target: 'AnalyzeScreen',
      icon: <AnalyzeColorIcon />,
    },
    {
      title: '设置',
      target: 'SettingsScreen',
      icon: <SettingsColorIcon />,
    },
  ]

  const onListItemPress = (target: string) => {
    switch (target) {
      case 'SettingsScreen':
        navigation.navigate('SettingsScreen', {})
        break
      case 'AnalyzeScreen':
        navigation.navigate('AnalyzeScreen', {})
        break
      default:
        navigation.navigate('HomeScreen', {})
    }

    toggleDrawer()
  }

  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        paddingHorizontal: 10,
        backgroundColor: theme.colors.background, // 使用主题背景色
      }}>
      <DrawerItemUser toggleDrawer={toggleDrawer} />
      <List.Section
        style={{
          width: '100%',
          backgroundColor: theme.colors.elevation.level1,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 4,
          marginBottom: 12,
        }}>
        {list.map(item => {
          const isActive = currentTarget === item.target
          return (
            <List.Item
              style={{
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: isActive ? theme.colors.primaryContainer : 'transparent',
              }}
              key={item.title}
              title={item.title}
              titleStyle={{ color: isActive ? theme.colors.onPrimaryContainer : theme.colors.primary }}
              left={() => item.icon}
              right={props => (
                <List.Icon
                  color={isActive ? theme.colors.onPrimaryContainer : theme.colors.primary}
                  icon="chevron-right"
                />
              )}
              onPress={() => onListItemPress(item.target)}
            />
          )
        })}
      </List.Section>
      {/** 外层使用 ScrollView，marginTop: 'auto' 无效 */}
      <DrawerItemBottom style={{ marginTop: 'auto' }} />
    </View>
  )
}

export default function AppLayout() {
  const [isShowDrawer, setIsShowDrawer] = useState(false)
  const navigationTheme = useNavigationTheme()

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <AuthGuard>
          <Drawer
            open={isShowDrawer}
            onOpen={() => setIsShowDrawer(true)}
            onClose={() => setIsShowDrawer(false)}
            renderDrawerContent={() => <CustomDrawerContent toggleDrawer={() => setIsShowDrawer(prev => !prev)} />}>
            <RootStack.Navigator
              initialRouteName="HomeScreen"
              screenOptions={{
                header: props => (
                  <HeaderProvider>
                    <Header {...props} toggleDrawer={() => setIsShowDrawer(prev => !prev)} />
                  </HeaderProvider>
                ),
              }}>
              <RootStack.Group screenOptions={{ headerShown: true }}>
                <RootStack.Screen name="Home" component={Home} options={{ title: '首页' }} />
                <RootStack.Screen name="SettingsScreen" component={Settings} options={{ title: '设置' }} />
                <RootStack.Screen name="AnalyzeScreen" component={Analyze} options={{ title: '分析' }} />
                <RootStack.Screen name="User" component={UserScreen} options={{ title: '个人中心' }} />
              </RootStack.Group>
              <RootStack.Group
                screenOptions={{
                  headerShown: true,
                  header: props => <CustomHeaderWithTitle {...props} />,
                }}>
                <RootStack.Screen
                  name="DetailScreen"
                  component={DetailScreen}
                  options={{
                    title: '详情',
                  }}
                />
              </RootStack.Group>
              {/* <RootStack.Group screenOptions={{ presentation: 'modal' }}> */}
              {/* <RootStack.Screen name="Adding" component={AddingScreen} /> */}
              {/* </RootStack.Group> */}
            </RootStack.Navigator>
          </Drawer>
        </AuthGuard>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
