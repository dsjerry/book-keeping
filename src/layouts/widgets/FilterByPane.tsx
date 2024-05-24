import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Chip } from 'react-native-paper'

import { OutTypes, CountTypeWithIconList } from '~consts/Data'
import CustomDivider from '~components/CustomDivider'
import { useKeepingStore, FilterBy } from '~store/keepingStore'

interface FilterPaneProps {
  onFilterChange?: (value: string) => void
}
export const FilterByPane: React.FC<FilterPaneProps> = ({ onFilterChange }) => {
  const [outTypes, setOutTypes] = useState([...OutTypes])
  const [countType, setCountType] = useState([...CountTypeWithIconList])
  const { filterBy, setFilterBy } = useKeepingStore()

  const onChipPress = (item: FilterBy) => {
    const array = [...filterBy]
    if (array.includes(item)) {
      array.splice(array.indexOf(item), 1)
    } else {
      array.push(item)
    }
    setFilterBy([...array])
  }

  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
      <CustomDivider text="内容" textPosi="left" />

      <View style={{ flexDirection: 'row' }}>
        <Chip
          icon={'note-text-outline'}
          mode="outlined"
          style={{ marginRight: 10 }}
          selected={filterBy.includes('note')}
          showSelectedOverlay
          onPress={() => onChipPress('note')}>
          备注
        </Chip>
        <Chip
          icon={'image-outline'}
          mode="outlined"
          selected={filterBy.includes('image')}
          showSelectedOverlay
          onPress={() => onChipPress('image')}>
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
            selected={filterBy.includes(item.alias)}
            showSelectedOverlay
            onPress={() => {
              onChipPress(item.alias)
            }}>
            {item.name}
          </Chip>
        ))}
      </View>

      <CustomDivider text="货币" textPosi="left" />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {countType.map(item => (
          <Chip
            key={item.id}
            icon={item.icon}
            mode="outlined"
            style={style.chip}
            selected={filterBy.includes(item.alias)}
            showSelectedOverlay
            onPress={() => onChipPress(item.alias)}>
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
