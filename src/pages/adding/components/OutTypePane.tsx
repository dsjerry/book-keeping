import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Chip } from 'react-native-paper'

import { useAdding } from '../hooks/useAdding'

// Chip 没有设置 onPress，点击的时候不会有样式变化

const OutTypePane = () => {
  const { outTypes, setOutTypes } = useAdding()

  const onChipPress = (item: OutType) => {
    setOutTypes(prev => {
      const index = prev.findIndex(chip => chip.id === item.id)
      prev[index] = { ...prev[index], isChecked: !prev[index].isChecked }
      return [...prev]
    })
  }
  return (
    <View style={style.pane}>
      {outTypes?.map(item => (
        <Chip
          selected={item.isChecked}
          showSelectedOverlay
          key={item.id}
          style={{ marginRight: 5, marginTop: 5 }}
          icon={item.icon}
          mode="outlined"
          onPress={() => onChipPress(item)}>
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

export default OutTypePane
