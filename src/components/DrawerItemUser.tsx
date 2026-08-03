import { View, StyleSheet, Pressable, Text } from 'react-native'
import { Avatar, useTheme, List } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useUserStore } from '~store/userStore'
import { useAppSettingsStore } from '~store/settingStore'
import { useKeepingStore } from '~store/keepingStore'
import { withAlpha } from '~utils'

const logoImg = require('../../assets/icon.png')

const ToLoginWidget: React.FC<LoginWidget> = ({ onLogin }) => {
  const theme = useTheme()
  return (
    <Pressable onPress={onLogin} android_ripple={{ color: theme.colors.onPrimaryContainer, borderless: false }}>
      <View style={toLogin.row}>
        <Avatar.Image size={40} source={logoImg} />
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
  const { monthlyBudget } = useAppSettingsStore()
  const { output } = useKeepingStore()
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

  const used = output
  const budget = monthlyBudget
  const isOver = used > budget && budget > 0
  const percent = budget > 0 ? Math.min((used / budget) * 100, 100) : 0

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
        <>
          <UserWidget username={currentUser.username} avatar={currentUser.avatar} onUser={onUserPress} />
          {budget > 0 && (
            <View style={budgetStyle.wrap}>
              <View style={budgetStyle.row}>
                <Text style={[budgetStyle.label, { color: theme.colors.onSurfaceVariant }]}>月度预算</Text>
                <Text style={[budgetStyle.value, { color: theme.colors.onSurface }]}>
                  ¥{used.toLocaleString()} / ¥{budget.toLocaleString()}
                </Text>
              </View>
              <View style={[budgetStyle.track, { backgroundColor: withAlpha(theme.colors.primary, 0.12) }]}>
                <View
                  style={[
                    budgetStyle.bar,
                    {
                      width: `${percent}%`,
                      backgroundColor: isOver ? theme.colors.error : theme.colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </>
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
    paddingTop: 16,
    paddingBottom: 16,
  },
})

const budgetStyle = StyleSheet.create({
  wrap: {
    marginTop: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { fontSize: 12 },
  value: { fontSize: 13, fontWeight: '600' },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: 6,
    borderRadius: 3,
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
