import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { NavigationContainer, useNavigation, DefaultTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Drawer } from 'react-native-drawer-layout'
import { List, useTheme } from 'react-native-paper'

import Home from '~pages/home'
import Settings from '~pages/settings'
import Analyze from '~pages/analyze'
import Header from './Header'
import DetailScreen from '~pages/home/DetailScreen'
import AddingScreen from '~pages/home/AddingScreen'
import UserScreen from '~pages/user'
import DrawerItemUser from '~components/DrawerItemUser'
import DrawerItemBottom from '~components/DrawerItemBottom'
import { CustomHeaderWithTitle } from './widgets'

import { HeaderProvider } from '../contexts/HeaderContext'

const RootStack = createStackNavigator()

interface DrawerContent {
  toggleDrawer: () => void
}

const CustomDrawerContent: React.FC<DrawerContent> = ({ toggleDrawer }) => {
  const navigation = useNavigation()
  const theme = useTheme() // 获取当前主题

  const list = [
    {
      title: '首页',
      target: 'HomeScreen',
      icon: 'home',
    },
    {
      title: '分析',
      target: 'AnalyzeScreen',
      icon: 'chart-bar-stacked',
    },
    {
      title: '设置',
      target: 'SettingsScreen',
      icon: 'cog-outline',
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
    <View style={{ 
      flex: 1, 
      height: '100%', 
      paddingHorizontal: 10,
      backgroundColor: theme.colors.background // 使用主题背景色
    }}>
      <DrawerItemUser toggleDrawer={toggleDrawer} />
      <List.Section
        style={{
          width: '100%',
        }}>
        {list.map(item => (
          <List.Item
            key={item.title}
            title={item.title}
            titleStyle={{ color: theme.colors.primary }}
            left={props => <List.Icon color={theme.colors.primary} icon={item.icon} />}
            right={props => <List.Icon color={theme.colors.primary} icon="chevron-right" />}
            onPress={() => onListItemPress(item.target)}
          />
        ))}
      </List.Section>
      {/** 外层使用 ScrollView，marginTop: 'auto' 无效 */}
      <DrawerItemBottom style={{ marginTop: 'auto' }} />
    </View>
  )
}

export default function AppLayout() {
  const [isShowDrawer, setIsShowDrawer] = useState(false)
  const [navigationTheme, setNavigationTheme] = useState(global.navigationTheme || DefaultTheme)

  // 监听全局主题变化
  useEffect(() => {
    const checkTheme = () => {
      if (global.navigationTheme && global.navigationTheme !== navigationTheme) {
        setNavigationTheme(global.navigationTheme)
      }
    }

    // 初始检查
    checkTheme()

    // 设置定时器定期检查主题变化
    const intervalId = setInterval(checkTheme, 300)

    return () => clearInterval(intervalId)
  }, [navigationTheme])

  return (
    <NavigationContainer theme={navigationTheme}>
      <Drawer
        open={isShowDrawer}
        onOpen={() => setIsShowDrawer(true)}
        onClose={() => setIsShowDrawer(false)}
        renderDrawerContent={() => (
          <CustomDrawerContent
            toggleDrawer={() => setIsShowDrawer(prev => !prev)}
          />
        )}>
        <RootStack.Navigator
          initialRouteName="HomeScreen"
          screenOptions={{
            header: props => (
              <HeaderProvider>
                <Header
                  {...props}
                  toggleDrawer={() => setIsShowDrawer(prev => !prev)}
                />
              </HeaderProvider>
            ),
          }}>
          <RootStack.Group screenOptions={{ headerShown: true }}>
            <RootStack.Screen
              name="Home"
              component={Home}
              options={{ title: '首页' }}
            />
            <RootStack.Screen
              name="SettingsScreen"
              component={Settings}
              options={{ title: '设置' }}
            />
            <RootStack.Screen
              name="AnalyzeScreen"
              component={Analyze}
              options={{ title: '分析' }}
            />
            <RootStack.Screen
              name="User"
              component={UserScreen}
              options={{ title: '个人中心' }}
            />
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
          <RootStack.Group screenOptions={{ presentation: 'modal' }}>
            {/* <RootStack.Screen name="Adding" component={AddingScreen} /> */}
          </RootStack.Group>
        </RootStack.Navigator>
      </Drawer>
    </NavigationContainer>
  )
}
