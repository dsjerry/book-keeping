import { View, StyleSheet } from 'react-native'
import { Chip } from 'react-native-paper'

// Chip 没有设置 onPress，点击的时候不会有样式变化

const OutTypePane: React.FC<Props> = ({ outTypes, onChipPress }) => {
  const onPress = (item: OutType) => {
    const _item = { ...item, isChecked: !item.isChecked }
    onChipPress(_item)
  }
  return (
    <View style={style.pane}>
      {outTypes.map(item => (
        <Chip
          selected={item.isChecked}
          showSelectedOverlay
          key={item.id}
          style={{ marginRight: 5, marginTop: 5 }}
          icon={item.icon}
          mode="outlined"
          onPress={() => onPress(item)}>
          {item.name}
        </Chip>
      ))}
    </View>
  )
}

const style = StyleSheet.create({
  pane: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 10,
  },
})

interface Props {
  outTypes: OutType[]
  onChipPress: (item: OutType) => void
}

export default OutTypePane
