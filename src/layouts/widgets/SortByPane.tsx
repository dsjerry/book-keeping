import { useState } from 'react'
import { View } from 'react-native'
import { List, Divider, Chip } from 'react-native-paper'
import { useKeepingStore } from '~store/keepingStore'

interface SortPaneProps {
  onSortChange: SortChange
}

export const SortByPane: React.FC<SortPaneProps> = ({ onSortChange }) => {
  const { sortBy, setSortBy, sortOrder, setSortOrder } = useKeepingStore()
  const onSortByPress = (value: KeepingStore['sortBy']) => {
    onSortChange({ sortBy: value, sortOrder })
    setSortBy(value)
  }
  const onSortOrderPress = (value: KeepingStore['sortOrder']) => {
    onSortChange({ sortBy, sortOrder: value })
    setSortOrder(value)
  }
  return (
    <>
      <List.Item
        title="按日期排序"
        left={props => <List.Icon {...props} icon="calendar" />}
        right={props =>
          sortBy === 'date' && (
            <List.Icon {...props} icon="check-circle-outline" />
          )
        }
        onPress={() => onSortByPress('date')}
      />
      <List.Item
        title="按金额排序"
        left={props => <List.Icon {...props} icon="wallet-outline" />}
        right={props =>
          (sortBy === 'amount' && (
            <List.Icon {...props} icon="check-circle-outline" />
          )) ||
          null
        }
        onPress={() => onSortByPress('amount')}
      />
      <Divider />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}>
        <Chip
          selected={sortOrder === 'desc'}
          showSelectedOverlay
          icon="sort-descending"
          mode="outlined"
          style={{ transform: [{ scale: 0.8 }] }}
          onPress={() => onSortOrderPress('desc')}>
          降序
        </Chip>
        <Chip
          selected={sortOrder === 'asc'}
          showSelectedOverlay
          icon="sort-ascending"
          mode="outlined"
          style={{ transform: [{ scale: 0.8 }] }}
          onPress={() => onSortOrderPress('asc')}>
          升序
        </Chip>
      </View>
    </>
  )
}
