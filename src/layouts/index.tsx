import { useState } from 'react'
import { View } from 'react-native'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Drawer } from 'react-native-drawer-layout'
import { List } from 'react-native-paper'

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
    <View style={{ flex: 1, height: '100%', paddingHorizontal: 10 }}>
      <DrawerItemUser toggleDrawer={toggleDrawer} />
      <List.Section
        style={{
          width: '100%',
        }}>
        {list.map(item => (
          <List.Item
            key={item.title}
            title={item.title}
            titleStyle={{ color: '#6b4faa' }}
            left={props => <List.Icon color="#6b4faa" icon={item.icon} />}
            right={props => <List.Icon color="#6b4faa" icon="chevron-right" />}
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

  return (
    <NavigationContainer>
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
            <RootStack.Screen name="User" component={UserScreen} />
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
