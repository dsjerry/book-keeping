import { View, ViewStyle } from 'react-native'
import { Button } from 'react-native-paper'

import { useUserStore } from '~store/userStore'
import { useKeepingStore, userUsersKeepingStore } from '~store/keepingStore'

const CloseLogout = () => {
  const { currentUser, setCurrentUser, users } = useUserStore()
  const { items, clearItems } = useKeepingStore()
  const { add } = userUsersKeepingStore()
  const onBtnPress = () => {
    add({
      userid: currentUser!.id,
      keeping: items,
    })
    setCurrentUser(null)
    clearItems()
  }
  return (
    <View
      style={{
        paddingVertical: 10,
        marginRight: 'auto',
      }}>
      <Button mode="text" icon={'power'} onPress={onBtnPress}>
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

export default DrawerItemBottom
