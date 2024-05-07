import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Chip } from 'react-native-paper'

import { OutTypes, CountTypeWithIconList } from '~consts/Data'
import CustomDivider from '~components/CustomDivider'

interface FilterPaneProps {
  onFilterChange?: (value: string) => void
}
export const FilterByPane: React.FC<FilterPaneProps> = ({ onFilterChange }) => {
  const [outTypes, setOutTypes] = useState([...OutTypes])
  const onOutTypePress = (item: OutType) => {
    setOutTypes(prev =>
      prev.map(i => {
        if (i.id === item.id) {
          return { ...i, isChecked: !i.isChecked }
        }
        return i
      }),
    )
  }
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
      <CustomDivider text="内容" textPosi="left" />

      <View style={{ flexDirection: 'row' }}>
        <Chip
          icon={'note-text-outline'}
          mode="outlined"
          style={{ marginRight: 10 }}>
          备注
        </Chip>
        <Chip icon={'image-outline'} mode="outlined">
          图片
        </Chip>
      </View>

      <CustomDivider text="类型" textPosi="left" />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {outTypes.map(item => (
          <Chip
            key={item.id}
            icon={item.icon}
            mode="outlined"
            style={style.chip}
            selected={item.isChecked}
            showSelectedOverlay
            onPress={() => onOutTypePress(item)}>
            {item.name}
          </Chip>
        ))}
      </View>

      <CustomDivider text="货币" textPosi="left" />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {CountTypeWithIconList.map(item => (
          <Chip
            key={item.id}
            icon={item.icon}
            mode="outlined"
            style={style.chip}
            selected={item.isChecked}
            showSelectedOverlay>
            {item.name}
          </Chip>
        ))}
      </View>
    </View>
  )
}

const style = StyleSheet.create({
  chip: {
    marginRight: 10,
    marginBottom: 10,
  },
})
