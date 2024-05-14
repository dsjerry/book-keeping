import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  Dimensions,
} from 'react-native'
import { Checkbox, Chip, Icon } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'

import LongPressMenu from '~components/LongPressMenu'
import { useHomeStore, useHomeStoreDispatch } from '../contexts/HomeContext'
import { _date } from '~utils'

/**
 * Checkbox 长按的时候再显示
 */
const Item: React.FC<ItemProps> = ({
  item,
  doNavigate,
  doMenuShow,
  toggle,
}) => {
  return (
    <>
      {item.isShow !== false && (
        <Pressable
          style={({ pressed }) => ({
            ...style.item,
            backgroundColor: pressed ? '#fffbfe' : '#fff',
            elevation: pressed ? 8 : 2,
          })}
          onPress={() => doNavigate(item.id)}
          onLongPress={e => doMenuShow(item.id, e)}>
          <View style={style.itemHeader}>
            {item.note && <Icon source={'note-text-outline'} size={14} />}
            {item.image && <Icon source={'image-outline'} size={14} />}
            <Text style={{ color: '#6d57a7', marginLeft: 5 }}>
              {/* {dayjs(item.date).format('YYYY-MM-DD')} */}
              {_date(item.date)}
            </Text>
          </View>
          <View style={style.itemBody}>
            <Checkbox
              status={item.isChecked ? 'checked' : 'unchecked'}
              onPress={() => toggle(item.id)}
            />
            <Text>支出</Text>
            <Text style={style.itemCount}>{item.count}</Text>
            <Text>元</Text>
          </View>
          <View style={tag.pane}>
            {/* 通过循环来做 */}
            {item.tags.map(tagItem => (
              <Chip
                style={tag.item}
                icon={tagItem.icon}
                mode="outlined"
                key={tagItem.id}>
                {tagItem.name}
              </Chip>
            ))}
          </View>
        </Pressable>
      )}
    </>
  )
}

const KeepingList: React.FC<Props> = ({ item, toggle }) => {
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const navigation = useNavigation()
  const dispatch = useHomeStoreDispatch()
  const { isShowMenu, longPressMenu: menu } = useHomeStore()

  // 长按菜单显示范围
  const screenWidth = Dimensions.get('screen').width
  const menuWidth = screenWidth * 0.25
  const safeArea = screenWidth - menuWidth

  const doNavigate = (id: string) => {
    navigation.navigate('DetailScreen', { hideHeader: true, id })
  }
  // 菜单的显示或隐藏
  const doMenuShow = (id: KeepingItem['id'], e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent

    if (locationX > safeArea) {
      setMenuPosition({ x: locationX - menuWidth, y: locationY })
    } else {
      setMenuPosition({ x: locationX, y: locationY })
    }

    dispatch({ type: 'isShowMenu', payload: !isShowMenu })
    dispatch({ type: 'activeKeeping', payload: [id] })
  }
  const onMenuClick = (id: MenuItem['id']) => {
    const item = menu.find(item => item.id === id)
    if (item?.alias === 'del') {
      dispatch({
        type: 'setModal',
        payload: { title: '删除', body: '确认删除吗?' },
      })
      dispatch({ type: 'isShowModal', payload: true })
    }

    dispatch({ type: 'isShowMenu', payload: false })
  }

  return (
    <View style={style.container}>
      {isShowMenu && (
        <LongPressMenu
          onPress={onMenuClick}
          items={menu}
          position={menuPosition}
        />
      )}
      <FlatList
        data={item}
        renderItem={({ item }) =>
          Item({ item, doNavigate, doMenuShow, toggle })
        }
      />
    </View>
  )
}

interface Props {
  item: KeepingItem[]
  toggle: KeepingStore['toggle']
}

interface ItemProps {
  item: KeepingItem
  doNavigate: (id: string) => void
  doMenuShow: (id: string, e: GestureResponderEvent) => void
  toggle: (id: string) => void
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
    color: '#6d57a7',
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
