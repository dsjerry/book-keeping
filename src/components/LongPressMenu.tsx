import { View, StyleSheet, GestureResponderEvent } from 'react-native'
import { Menu, useTheme } from 'react-native-paper'

/**
 * shadow 只能用来设置 IOS 的阴影，安卓端使用 elevation: number
 */

const LongPressMenu: React.FC<Props> = ({ items, position, onPress }) => {
  const theme = useTheme()

  return (
    <View
      style={[
        style.container,
        {
          backgroundColor: theme.colors.surface,
          top: position?.y,
          left: position?.x,
        },
      ]}>
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
    minWidth: 140,
    position: 'absolute',
    zIndex: 9999,
    elevation: 5,
    borderRadius: 12,
    paddingVertical: 4,
  },
  menu: {},
})

interface Props {
  items: MenuItem[]
  position?: { x: number; y: number }
  onPress: (id: string, e: GestureResponderEvent) => void
}

export default LongPressMenu
