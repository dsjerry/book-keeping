import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Chip, Icon, useTheme } from 'react-native-paper'

import { OutTypes, CountTypeWithIconList } from '~consts/Data'
import CustomDivider from '~components/CustomDivider'
import { useKeepingStore, FilterBy } from '~store/keepingStore'

export const FilterByPane: React.FC = () => {
  const [outTypes] = useState([...OutTypes])
  const [countType] = useState([...CountTypeWithIconList])
  const { filterBy, setFilterBy } = useKeepingStore()
  const theme = useTheme()

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
    <View style={[style.container, { backgroundColor: theme.colors.background }]}>
      <CustomDivider text="内容" textPosi="left" />

      <View style={style.row}>
        <Chip
          icon={'note-text-outline'}
          mode="outlined"
          style={style.chip}
          selected={filterBy.includes('note')}
          showSelectedOverlay
          onPress={() => onChipPress('note')}>
          备注
        </Chip>
        <Chip
          icon={'image-outline'}
          mode="outlined"
          style={style.chip}
          selected={filterBy.includes('image')}
          showSelectedOverlay
          onPress={() => onChipPress('image')}>
          图片
        </Chip>
      </View>

      <CustomDivider text="类型" textPosi="left" />

      <View style={style.wrapRow}>
        {outTypes.map(item => {
          const iconColor = (
            item.color ? theme.colors[item.color as keyof typeof theme.colors] : theme.colors.onSurfaceVariant
          ) as string
          return (
            <Chip
              key={item.id}
              icon={({ size }) => <Icon source={item.icon} size={size} color={iconColor} />}
              mode="outlined"
              style={style.chip}
              selected={filterBy.includes(item.alias)}
              showSelectedOverlay
              onPress={() => {
                onChipPress(item.alias)
              }}>
              {item.name}
            </Chip>
          )
        })}
      </View>

      <CustomDivider text="货币" textPosi="left" />

      <View style={style.wrapRow}>
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
  container: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 10,
    marginBottom: 10,
  },
})
