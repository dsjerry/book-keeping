import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native'
import { Checkbox, Chip, Icon } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import type { MenuAction } from '@react-native-menu/menu'

// import LongPressMenu from '~components/LongPressMenu'
import CustomMenuView from '~components/CustomMenuView'
import { useHomeStore, useHomeStoreDispatch } from '../contexts/HomeContext'
import { _date } from '~utils'
import { _COLORS } from '~consts/Colors'
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
}

/**
 * Checkbox 长按的时候再显示
 */
const Item: React.FC<ItemProps> = ({
  item,
  doNavigate,
  onLongPress,
  onMenuPress,
  toggle,
}) => {
  return (
    <>
      {item.isShow !== false && (
        <CustomMenuView
          actions={menuAction}
          onPress={id => onMenuPress(id, item.id)}>
          <Pressable
            style={({ pressed }) => ({
              ...style.item,
              backgroundColor: pressed ? '#fffbfe' : '#fff',
              elevation: pressed ? 8 : 2,
            })}
            onPress={() => doNavigate(item.id)}
            onLongPress={e => onLongPress(item.id)}>
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
              <Text>{item.type === 'in' ? '收入' : '支出'}</Text>
              <Text style={style.itemCount}>{item.count}</Text>
              <Text>元</Text>
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
}

const KeepingList: React.FC<Props> = ({ item, toggle, remove }) => {
  const navigation = useNavigation()
  const dispatch = useHomeStoreDispatch()
  const {
    isShowMenu,
    longPressMenu: menu,
    modal,
    activeKeeping,
  } = useHomeStore()

  const { confirmRemove } = useAppSettingsStore()

  // 长按菜单显示范围
  const screenWidth = Dimensions.get('screen').width
  const menuWidth = screenWidth * 0.25
  const safeArea = screenWidth - menuWidth

  const doNavigate = (id: string) => {
    navigation.navigate('DetailScreen', { hideHeader: true, id })
  }
  const onItemLongPress = (itemId: KeepingItem['id']) => {
    dispatch({ type: 'activeKeeping', payload: [itemId] })
  }

  const onItemMenuPress = (
    actionId: MenuAction['id'],
    itemId: KeepingItem['id'],
  ) => {
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
    }
    // 选中/取消选中
    else if (actionId === 'toggle') {
      toggle(itemId)
    } else {
      navigation.navigate('DetailScreen', { hideHeader: true, id: itemId })
    }
  }
  return (
    <View style={style.container}>
      <FlatList
        data={item}
        renderItem={({ item }) =>
          Item({
            item,
            doNavigate,
            onLongPress: onItemLongPress,
            onMenuPress: onItemMenuPress,
            toggle,
          })
        }
      />
    </View>
  )
}

const menuAction: MenuAction[] = [
  {
    id: 'info',
    title: '详情',
    titleColor: _COLORS.main,
  },
  {
    id: 'toggle',
    title: '选中',
    titleColor: _COLORS.main,
  },
  {
    id: 'del',
    title: '删除',
    titleColor: _COLORS.main,
  },
]

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
