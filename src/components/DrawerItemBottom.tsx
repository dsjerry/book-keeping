import { View, ViewStyle } from 'react-native'
import { Button } from 'react-native-paper'

const CloseLogout = () => {
  return (
    <View
      style={{
        paddingVertical: 10,
        marginRight: 'auto',
      }}>
      <Button mode="text" icon={'power'} onPress={() => console.log('Pressed')}>
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
