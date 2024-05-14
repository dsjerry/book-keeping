import { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Chip } from 'react-native-paper'

interface ChipItem {
  id: string
  name: string
  icon: string
  alias: string
  isChecked: boolean
}
interface Props {
  items: ChipItem[]
  onPress: (item: ChipItem) => void
}

const CustomChipPane: React.FC<Props> = ({ items, onPress }) => {
  const chips = items

  useEffect(() => {
    return () => {
      chips.forEach(item => {
        item.isChecked = false
      })
    }
  }, [])

  return (
    <View style={style.pane}>
      {chips.map(item => (
        <Chip
          selected={item.isChecked}
          showSelectedOverlay
          key={item.id}
          style={style.chip}
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
  chip: {
    marginRight: 5,
    marginTop: 5,
  },
})

export default CustomChipPane
