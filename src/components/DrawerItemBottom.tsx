import { View, ViewStyle } from 'react-native'
import { Button } from 'react-native-paper'

import { useUserStore } from '~store/userStore'

const CloseLogout = () => {
  const { logout } = useUserStore()
  return (
    <View
      style={{
        paddingVertical: 10,
        marginRight: 'auto',
      }}>
      <Button mode="text" icon={'power'} onPress={() => logout()}>
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
