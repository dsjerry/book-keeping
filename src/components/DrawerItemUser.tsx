import { useState, useEffect } from 'react'
import { View, StyleSheet, Pressable, Text } from 'react-native'
import { Button, Avatar, useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

import { useUserStore } from '~store/userStore'

const ToLoginWidget: React.FC<LoginWidget> = ({ onLogin }) => {
  const theme = useTheme() // 获取当前主题
  return (
    <View>
      <Button
        style={{ paddingLeft: 0 }}
        mode="text"
        icon={'login'}
        textColor={theme.colors.primary}
        onPress={onLogin}>
        登录 / 注册
      </Button>
    </View>
  )
}

const UserWidget: React.FC<UserWidget> = ({ username, avatar, onUser }) => {
  const theme = useTheme() // 获取当前主题
  return (
    <Pressable style={userWidget.container} onPress={onUser}>
      {avatar ? (
        <Avatar.Image size={40} source={{ uri: avatar }} />
      ) : (
        <Avatar.Text size={40} label={username?.substring(0, 1)} />
      )}
      <Button
        style={userWidget.username}
        icon={'chevron-right'}
        textColor={theme.colors.primary}
        contentStyle={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>{username}</Text>
      </Button>
    </Pressable>
  )
}

interface DrawerItemUserProps {
  toggleDrawer: () => void
}

const DrawerItemUser: React.FC<DrawerItemUserProps> = ({ toggleDrawer }) => {
  const navigation = useNavigation()
  const { currentUser } = useUserStore()
  const theme = useTheme() // 获取当前主题

  useEffect(() => {
    console.log(currentUser)
  }, [currentUser])

  const onLoginPress = () => {
    navigation.navigate('User', { screen: 'LoginScreen' })
    toggleDrawer()
  }
  const onUserPress = () => {
    navigation.navigate('User', { screen: 'UserHomeScreen' })
    toggleDrawer()
  }
  return (
    <View style={[style.container, { borderBottomColor: theme.colors.outlineVariant }]}>
      {currentUser ? (
        <UserWidget
          username={currentUser.username}
          avatar={currentUser.avatar}
          onUser={onUserPress}
        />
      ) : (
        <ToLoginWidget onLogin={onLoginPress} />
      )}
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderBottomWidth: 0.6,
    // 边框颜色将通过主题动态设置
  },
})

const userWidget = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    verticalAlign: 'top',
  },
  username: {
    marginLeft: -5,
  },
})

interface LoginWidget {
  onLogin: () => void
}

interface UserWidget {
  username: string
  avatar?: string
  onUser: () => void
}

export default DrawerItemUser
