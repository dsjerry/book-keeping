import { View, ViewStyle, StyleSheet } from 'react-native'
import { Button, useTheme } from 'react-native-paper'

import { useUserStore } from '~store/userStore'
import { useKeepingStore, userUsersKeepingStore } from '~store/keepingStore'
import { AuthService } from '~api/auth'
import { useAppSettingsStore } from '~store/settingStore'

const CloseLogout = () => {
  const { currentUser, setCurrentUser, users } = useUserStore()
  const { items, clearItems } = useKeepingStore()
  const { add } = userUsersKeepingStore()
  const { useOnline, toggleUseOnline } = useAppSettingsStore()
  const theme = useTheme()
  const onBtnPress = async () => {
    // 已登录服务端时先登出：吊销 refresh token + 清除本地凭证（失败不阻塞本地退出）
    if (useOnline && currentUser?.serverId) {
      await AuthService.logout().catch(() => null)
      toggleUseOnline()
    }
    add({
      userid: currentUser!.id,
      keeping: items,
    })
    setCurrentUser(null)
    clearItems()
  }
  return (
    <View style={style.closeLogout}>
      <Button mode="text" icon={'power'} textColor={theme.colors.primary} onPress={onBtnPress}>
        关闭 / 退出登录
      </Button>
    </View>
  )
}

const DrawerItemBottom = ({ style }: { style?: ViewStyle }) => {
  return (
    <View style={style}>
      <CloseLogout />
    </View>
  )
}

const style = StyleSheet.create({
  closeLogout: {
    paddingVertical: 10,
    marginRight: 'auto',
  },
})

export default DrawerItemBottom
