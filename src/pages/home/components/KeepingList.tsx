import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native'
import { Checkbox, Chip, Icon, useTheme } from 'react-native-paper'
import type { MD3Theme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import type { MenuAction } from '@react-native-menu/menu'
import React, { useCallback, memo } from 'react'

import CustomMenuView from '~components/CustomMenuView'
import { useHomeStore, useHomeStoreDispatch } from '../contexts/HomeContext'
import { _date } from '~utils'
import { useAppSettingsStore } from '~store/settingStore'

interface Props {
  item: KeepingItem[]
  toggle: KeepingStore['toggle']
  remove: KeepingStore['remove']
}

interface ItemProps {
  item: KeepingItem
  doNavigate: (id: string) => void
  onLongPress: (itemId: KeepingItem['id']) => void
  onMenuPress: (actionId: MenuAction['id'], itemId: KeepingItem['id']) => void
  toggle: (id: string) => void
  theme: MD3Theme
}

const getMenuActions = (theme: MD3Theme): MenuAction[] => [
  {
    id: 'info',
    title: '详情',
    titleColor: theme.colors.primary,
  },
  {
    id: 'toggle',
    title: '选中',
    titleColor: theme.colors.primary,
  },
  {
    id: 'del',
    title: '删除',
    titleColor: theme.colors.primary,
  },
]

const ListItem: React.FC<ItemProps> = memo(({
  item,
  doNavigate,
  onLongPress,
  onMenuPress,
  toggle,
  theme,
}) => {
  return (
    <>
      {item.isShow !== false && (
        <CustomMenuView
          actions={getMenuActions(theme)}
          onPress={id => onMenuPress(id, item.id)}>
          <Pressable
            style={({ pressed }) => ({
              ...style.item,
              backgroundColor: pressed
                ? theme.colors.surfaceVariant
                : theme.colors.surface,
              elevation: pressed ? 8 : 2,
              borderColor: theme.colors.outline,
            })}
            onPress={() => doNavigate(item.id)}
            onLongPress={e => onLongPress(item.id)}>
            <View style={style.itemHeader}>
              {item.note && <Icon source={'note-text-outline'} size={14} color={theme.colors.primary} />}
              {item.image && <Icon source={'image-outline'} size={14} color={theme.colors.primary} />}
              <Text style={{ color: theme.colors.primary, marginLeft: 5 }}>
                {_date(item.date)}
              </Text>
            </View>
            <View style={style.itemBody}>
              <Checkbox
                status={item.isChecked ? 'checked' : 'unchecked'}
                onPress={() => toggle(item.id)}
              />
              <Text style={{ color: theme.colors.primary }}>{item.type === 'in' ? '收入' : '支出'}</Text>
              <Text style={[style.itemCount, { color: theme.colors.primary }]}>{item.count}</Text>
              <Text style={{ color: theme.colors.primary }}>元</Text>
            </View>
            <View style={tag.pane}>
              {item.tags.map(tagItem => (
                <Chip
                  style={tag.item}
                  icon={tagItem.icon}
                  mode="outlined"
                  key={tagItem.id}>
                  {tagItem.name}
                </Chip>
              ))}
              {item.tags.length === 0 && (
                <Chip
                  style={[tag.item, { opacity: 0.5 }]}
                  mode="outlined"
                  icon="tag-multiple-outline">
                  分类
                </Chip>
              )}
            </View>
          </Pressable>
        </CustomMenuView>
      )}
    </>
  )
})

const KeepingList: React.FC<Props> = ({ item, toggle, remove }) => {
  const navigation = useNavigation()
  const dispatch = useHomeStoreDispatch()
  const theme = useTheme()
  const {
    modal,
    activeKeeping,
  } = useHomeStore()

  const { confirmRemove } = useAppSettingsStore()

  const doNavigate = useCallback((id: string) => {
    navigation.navigate('DetailScreen', { hideHeader: true, id })
  }, [navigation])

  const onItemLongPress = useCallback((itemId: KeepingItem['id']) => {
    dispatch({ type: 'activeKeeping', payload: [itemId] })
  }, [dispatch])

  const onItemMenuPress = useCallback(
    (actionId: MenuAction['id'], itemId: KeepingItem['id']) => {
      dispatch({ type: 'activeKeeping', payload: [itemId] })
      if (actionId === 'del') {
        if (!confirmRemove) return activeKeeping.forEach(id => remove(id))
        dispatch({
          type: 'modal',
          payload: {
            ...modal,
            title: '删除',
            body: '确认删除吗?',
            isShow: true,
            onAccess: () => {
              activeKeeping.forEach(id => remove(id))
              dispatch({
                type: 'modal',
                payload: {
                  ...modal,
                  isShow: false,
                  status: true,
                },
              })
            },
            onCancel: () => {
              dispatch({
                type: 'modal',
                payload: { ...modal, isShow: false, status: false },
              })
            },
          },
        })
      } else if (actionId === 'toggle') {
        toggle(itemId)
      } else {
        navigation.navigate('DetailScreen', { hideHeader: true, id: itemId })
      }
    },
    [dispatch, confirmRemove, activeKeeping, modal, remove, toggle, navigation],
  )

  const renderItem = useCallback(
    ({ item }: { item: KeepingItem }) => (
      <ListItem
        item={item}
        doNavigate={doNavigate}
        onLongPress={onItemLongPress}
        onMenuPress={onItemMenuPress}
        toggle={toggle}
        theme={theme}
      />
    ),
    [doNavigate, onItemLongPress, onItemMenuPress, toggle, theme],
  )

  return (
    <View style={style.container}>
      <FlatList
        data={item}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 10,
  },
  item: {
    width: '96%',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 5,
    paddingRight: 10,
    borderRadius: 5,
    elevation: 2,
    // borderWidth: 0.5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  itemBody: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  itemFooter: {},
  itemCount: {
    fontSize: 20,
    marginHorizontal: 5,
  },
})

const tag = StyleSheet.create({
  pane: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginLeft: 30,
  },
  item: {
    marginHorizontal: -10,
    transform: [{ scale: 0.65 }],
  },
})

export { KeepingList }
