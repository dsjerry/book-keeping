import { View, StyleSheet, GestureResponderEvent } from 'react-native'
import { Menu } from 'react-native-paper'

/**
 * shadow 只能用来设置 IOS 的阴影，安卓端使用 elevation: number
 */

const LongPressMenu: React.FC<Props> = ({ items, position, onPress }) => {
  return (
    <View style={[style.container, { top: position?.y, left: position?.x }]}>
      {items.map(item => (
        <Menu.Item
          key={item.id}
          title={item.name}
          leadingIcon={item.icon}
          style={style.menu}
          onPress={e => onPress(item.id, e)}
        />
      ))}
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    width: '25%',
    flex: 1,
    position: 'absolute',
    right: 30,
    zIndex: 9999,
    backgroundColor: '#ffffff',
    elevation: 5, // android 端设置阴影
    borderRadius: 5,
  },
  menu: {},
})

interface MenuItem {
  id: string
  name: string
  icon: string
}

interface Props {
  items: MenuItem[]
  position?: { x: number; y: number }
  onPress: (id: string, e: GestureResponderEvent) => void
}

export default LongPressMenu
