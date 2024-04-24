import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  GestureResponderEvent,
  Dimensions,
} from 'react-native'
import { Checkbox, Chip } from 'react-native-paper'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useState } from 'react'
import dayjs from 'dayjs'

import LongPressMenu from 'components/LongPressMenu'

/**
 * Checkbox 长按的时候再显示
 */
const Item: React.FC<ItemProps> = ({ item, doNavigate, doMenuShow }) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        ...style.item,
        backgroundColor: pressed ? '#fffbfe' : '#fff',
      })}
      onPress={() => doNavigate(item.id)}
      onLongPress={e => doMenuShow(item.id, e)}>
      <View style={style.itemHeader}>
        <Text style={{ marginLeft: 'auto' }}>
          {dayjs(item.date).format('YYYY-MM-DD')}
        </Text>
      </View>
      <View style={style.itemBody}>
        <Checkbox status="unchecked" onPress={() => console.log(123)} />
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
  )
}

const KeepingList: React.FC<Props> = ({ item }) => {
  const [isShowMenu, setIsShowMenu] = useState(false)
  const [menu, setMenu] = useState([
    { id: '1', icon: 'information', name: '信息', alias: 'info' },
    { id: '2', icon: 'delete', name: '删除', alias: 'del' },
  ])
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const navigation = useNavigation()
  const route = useRoute()

  // 长按菜单显示范围
  const screenWidth = Dimensions.get('screen').width
  const menuWidth = screenWidth * 0.25
  const safeArea = screenWidth - menuWidth

  const doNavigate = (id: string) => {
    navigation.navigate('Detail' as never, { id } as never)
    console.log(route.path)
  }
  // 菜单的显示或隐藏
  const doMenuShow = (id: string, e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent

    if (locationX > safeArea) {
      setMenuPosition({ x: locationX - menuWidth, y: locationY })
    } else {
      setMenuPosition({ x: locationX, y: locationY })
    }

    if (id) {
      console.log('点击了菜单:', id)
    }

    setIsShowMenu(prev => !prev)
  }

  return (
    <View style={style.container}>
      {isShowMenu && (
        <LongPressMenu
          onPress={doMenuShow}
          items={menu}
          position={menuPosition}
        />
      )}
      <FlatList
        data={item}
        renderItem={({ item }) => Item({ item, doNavigate, doMenuShow })}
      />
    </View>
  )
}

interface Props {
  item: KeepingItem[]
}

interface ItemProps {
  item: KeepingItem
  doNavigate: (id: string) => void
  doMenuShow: (id: string, e: GestureResponderEvent) => void
}

const style = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    width: '96%',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 5,
    paddingRight: 10,
    borderWidth: 0.5,
    borderRadius: 5,
  },
  itemHeader: {},
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
    marginLeft: 10,
  },
  item: {
    marginLeft: 10,
    transform: [{ scale: 0.8 }],
  },
})

export { KeepingList }
