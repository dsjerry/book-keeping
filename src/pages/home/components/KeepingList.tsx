import { View, Text, FlatList, StyleSheet, Pressable, Image } from 'react-native'
import { Checkbox, Chip, Icon, useTheme } from 'react-native-paper'
import type { MD3Theme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import type { MenuAction } from '@react-native-menu/menu'
import React, { useCallback, memo, useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'

import CustomMenuView from '~components/CustomMenuView'
import { useHomeStore, useHomeStoreDispatch } from '../contexts/HomeContext'
import { _date, withAlpha } from '~utils'
import { useAppSettingsStore } from '~store/settingStore'
import { useKeepingStore } from '~store/keepingStore'

interface Props {
  item: KeepingItem[]
  toggle: KeepingStore['toggle']
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

const ListItem: React.FC<ItemProps> = memo(({ item, doNavigate, onLongPress, onMenuPress, toggle, theme }) => {
  // 收入用青绿（tertiary）、支出用主题深紫（primary）——避免 error 红的生硬感，
  // 两色均为主题色系，协调且收支一眼可辨
  const amountColor = item.type === 'in' ? theme.colors.tertiary : theme.colors.primary
  const hasImage = !!item.image
  const [pressed, setPressed] = useState(false)

  // 有图记录：图片作为卡片背景，叠加"左高→右低"渐变遮罩（左雾化保证文字可读、右侧渐显图片）
  const backgroundLayer = hasImage ? (
    <>
      <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient
        colors={[
          withAlpha(theme.colors.surfaceVariant, 0.95),
          withAlpha(theme.colors.surfaceVariant, 0.4),
          withAlpha(theme.colors.surfaceVariant, 0.05),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      {pressed && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: withAlpha(theme.colors.onSurface, 0.06) }]} />
      )}
    </>
  ) : null

  return (
    <>
      {item.isShow !== false && (
        <CustomMenuView actions={getMenuActions(theme)} onPress={id => onMenuPress(id, item.id)}>
          <Pressable
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[
              style.item,
              !hasImage && { backgroundColor: pressed ? theme.colors.elevation.level2 : theme.colors.surfaceVariant },
            ]}
            onPress={() => doNavigate(item.id)}
            onLongPress={e => onLongPress(item.id)}>
            {backgroundLayer}
            <View style={style.itemHeader}>
              {item.note && <Icon source={'note-text-outline'} size={14} color={theme.colors.tertiary} />}
              {item.image && <Icon source={'image-outline'} size={14} color={theme.colors.tertiary} />}
              {item.address && <Icon source={'map-marker-outline'} size={14} color={theme.colors.tertiary} />}
              <Text style={[style.headerDate, { color: theme.colors.onSurfaceVariant }]}>{_date(item.date)}</Text>
            </View>
            <View style={style.itemBody}>
              <Checkbox status={item.isChecked ? 'checked' : 'unchecked'} onPress={() => toggle(item.id)} />
              <Text
                style={[style.itemType, { color: item.type === 'in' ? theme.colors.tertiary : theme.colors.primary }]}>
                {item.type === 'in' ? '收入' : '支出'}
              </Text>
              <Text style={[style.itemCount, { color: amountColor }]}>{item.count}</Text>
              <Text style={[style.itemUnit, { color: theme.colors.onSurfaceVariant }]}>元</Text>
            </View>
            <View style={tag.pane}>
              {item.tags.map(tagItem => {
                const tagIconColor = (
                  tagItem.color
                    ? theme.colors[tagItem.color as keyof typeof theme.colors]
                    : theme.colors.onSurfaceVariant
                ) as string
                return (
                  <Chip
                    style={[tag.item, { backgroundColor: withAlpha(theme.colors.tertiary, 0.08) }]}
                    icon={({ size }) => <Icon source={tagItem.icon} size={size} color={tagIconColor} />}
                    mode="flat"
                    compact
                    key={tagItem.id}>
                    {tagItem.name}
                  </Chip>
                )
              })}
            </View>
          </Pressable>
        </CustomMenuView>
      )}
    </>
  )
})

const KeepingList: React.FC<Props> = ({ item, toggle }) => {
  const navigation = useNavigation()
  const dispatch = useHomeStoreDispatch()
  const theme = useTheme()
  const { modal, activeKeeping } = useHomeStore()
  const { confirmRemove } = useAppSettingsStore()

  const doNavigate = useCallback(
    (id: string) => {
      navigation.navigate('DetailScreen', { hideHeader: true, id })
    },
    [navigation],
  )

  const onItemLongPress = useCallback(
    (itemId: KeepingItem['id']) => {
      dispatch({ type: 'activeKeeping', payload: [itemId] })
    },
    [dispatch],
  )

  // 从 store 中取删除方法，避免在回调中持有过期引用
  const removeItem = useCallback((id: string) => {
    const { remove } = useKeepingStore.getState()
    remove(id)
  }, [])

  const onItemMenuPress = useCallback(
    (actionId: MenuAction['id'], itemId: KeepingItem['id']) => {
      dispatch({ type: 'activeKeeping', payload: [itemId] })
      if (actionId === 'del') {
        if (!confirmRemove) return activeKeeping.forEach(id => removeItem(id))
        dispatch({
          type: 'modal',
          payload: {
            ...modal,
            title: '删除',
            body: '确认删除吗?',
            isShow: true,
            onAccess: () => {
              activeKeeping.forEach(id => removeItem(id))
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
    [dispatch, confirmRemove, activeKeeping, modal, navigation, toggle, removeItem],
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
        contentContainerStyle={style.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    paddingTop: 4,
  },
  listContent: {
    paddingBottom: 80,
  },
  item: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerDate: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  itemBody: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  itemType: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  itemCount: {
    fontSize: 30,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    marginHorizontal: 6,
  },
  itemUnit: {
    fontSize: 12,
  },
})

const tag = StyleSheet.create({
  pane: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  item: {
    marginHorizontal: 3,
    marginVertical: 2,
  },
})

export { KeepingList }
