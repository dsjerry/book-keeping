import { View, StyleSheet } from 'react-native'
import { Chip } from 'react-native-paper'

import { useAdding } from './hooks/useAdding'

// Chip 没有设置 onPress，点击的时候不会有样式变化

interface Props {
  onPress: (value: any) => void
}

const OutTypePane: React.FC<Props> = ({ onPress }) => {
  const { outTypes } = useAdding()

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
          onPress={() => onPress({ ...item, isChecked: !item.isChecked })}>
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
  },
})

export default OutTypePane
