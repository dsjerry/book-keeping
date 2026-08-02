import { View, StyleSheet, Pressable, Text } from 'react-native'
import { Avatar, useTheme, List } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useUserStore } from '~store/userStore'

const ToLoginWidget: React.FC<LoginWidget> = ({ onLogin }) => {
  const theme = useTheme()
  return (
    <Pressable onPress={onLogin} android_ripple={{ color: theme.colors.onPrimaryContainer, borderless: false }}>
      <View style={toLogin.row}>
        <Avatar.Icon
          icon="wallet"
          size={40}
          style={{ backgroundColor: 'transparent' }}
          color={theme.colors.onPrimaryContainer}
        />
        <View style={toLogin.textArea}>
          <Text style={[toLogin.title, { color: theme.colors.onPrimaryContainer }]}>登录 / 注册</Text>
          <Text style={[toLogin.subtitle, { color: theme.colors.onPrimaryContainer }]}>开启记账之旅</Text>
        </View>
        <List.Icon icon="chevron-right" color={theme.colors.onPrimaryContainer} />
      </View>
    </Pressable>
  )
}

const UserWidget: React.FC<UserWidget> = ({ username, avatar, onUser }) => {
  const theme = useTheme()
  return (
    <Pressable onPress={onUser} android_ripple={{ color: theme.colors.primary, borderless: false }}>
      <View style={userWidget.row}>
        {avatar ? (
          <Avatar.Image size={48} source={{ uri: avatar }} />
        ) : (
          <Avatar.Text size={48} label={username?.substring(0, 1)} />
        )}
        <View style={userWidget.textArea}>
          <Text style={[userWidget.username, { color: theme.colors.onSurface }]}>{username}</Text>
          <Text style={[userWidget.subtitle, { color: theme.colors.onSurfaceVariant }]}>我的账户</Text>
        </View>
        <List.Icon icon="chevron-right" color={theme.colors.onSurfaceVariant} />
      </View>
    </Pressable>
  )
}

interface DrawerItemUserProps {
  toggleDrawer: () => void
}

const DrawerItemUser: React.FC<DrawerItemUserProps> = ({ toggleDrawer }) => {
  const navigation = useNavigation()
  const { currentUser } = useUserStore()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const onLoginPress = () => {
    navigation.navigate('User', { screen: 'LoginScreen' })
    toggleDrawer()
  }
  const onUserPress = () => {
    navigation.navigate('User', { screen: 'UserHomeScreen' })
    toggleDrawer()
  }
  return (
    <View
      style={[
        style.container,
        {
          paddingTop: insets.top,
          backgroundColor: currentUser ? theme.colors.elevation.level1 : theme.colors.primaryContainer,
        },
      ]}>
      {currentUser ? (
        <UserWidget username={currentUser.username} avatar={currentUser.avatar} onUser={onUserPress} />
      ) : (
        <ToLoginWidget onLogin={onLoginPress} />
      )}
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
})

const toLogin = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
})

const userWidget = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
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
