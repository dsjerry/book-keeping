import { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Button, Avatar } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

const ToLoginWidget: React.FC<LoginWidget> = ({ onLogin }) => {
  return (
    <View>
      <Button
        style={{ paddingLeft: 0 }}
        mode="text"
        icon={'login'}
        onPress={onLogin}>
        登录 / 注册
      </Button>
    </View>
  )
}

const UserWidget: React.FC<UserWidget> = ({ username, onUser }) => {
  return (
    <Pressable style={userWidget.container} onPress={onUser}>
      <Avatar.Text label={username.substring(0, 1)} size={32} />
      <Button
        style={userWidget.username}
        icon={'chevron-right'}
        contentStyle={{ flexDirection: 'row-reverse' }}>
        {username}
      </Button>
    </Pressable>
  )
}

const DrawerItemUser = () => {
  const [isLogin, setIsLogin] = useState(false)
  const navigation = useNavigation()

  const onLoginPress = () => {
    navigation.navigate('User' as never, { screen: 'LoginScreen' } as never)
  }
  const onUserPress = () => {}
  return (
    <View style={style.container}>
      {isLogin ? (
        <UserWidget username="飞翔的企鹅" onUser={onUserPress} />
      ) : (
        <ToLoginWidget onLogin={onLoginPress} />
      )}
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: '#e7e0ec',
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
