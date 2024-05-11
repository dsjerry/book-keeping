import { View, Text, StyleSheet, Pressable } from 'react-native'
import { IconButton, Menu, Divider, Icon } from 'react-native-paper'

import type { DrawerHeaderProps } from '@react-navigation/drawer'

import HalfModal from '~components/HalfModal'
import { useKeepingStore } from '~store/keepingStore'
import { logging } from '~utils'
import {
  SortByPane,
  FilterByPane,
  MenuItemFroChecked,
  MenuItemForNormal,
} from './widgets'
import { useHeaderContext } from '../contexts/HeaderContext'

interface HeaderProps extends DrawerHeaderProps {
  menu?: MenuItem
}
export type RightMenuItem = 'sort' | 'filter' | 'all' | 'invert' | 'delete'

const Header: React.FC<HeaderProps> = ({ route, navigation, options }) => {
  const {
    items,
    sort,
    sortBy,
    sortOrder,
    filterBy,
    filter,
    selectAll,
    selectInverse,
    removeChecked,
  } = useKeepingStore()
  const {
    state: { isShowRightMenu, isShowBottomModal, halfModalType },
    dispatch,
  } = useHeaderContext()

  const page = route.name

  const itemSelected = items.filter(item => item.isChecked).length

  const setIsShowRightMenu = (flag: boolean) => {
    dispatch({ type: 'isShowRightMenu', payload: flag })
  }
  const setIsShowBottomModal = (flag: boolean) => {
    dispatch({ type: 'isShowBottomModal', payload: flag })
  }

  const onLeftMenuPress = () => navigation.openDrawer()
  const onRightMenuClose = () => {}
  const onRightMenuItemPress = (item: RightMenuItem) => {
    // TODO
    if (item == 'filter' || item == 'sort') {
      dispatch({ type: 'halfModalType', payload: item })
    } else if (item == 'all') {
      selectAll()
    } else if (item === 'delete') {
      removeChecked()
    } else if (item === 'invert') {
      selectInverse()
    }
    setIsShowRightMenu(false)
  }
  const onSortChange: SortChange = value => {
    sort({ sortBy: value.sortBy, sortOrder: value.sortOrder })
  }
  const onHalfModalClose = () => {
    setIsShowBottomModal(false)
    if (halfModalType === 'sort') {
      onSortChange({ sortBy, sortOrder })
    } else {
      logging.info('filterBy', filterBy)
      filter()
    }
  }

  const _showWhatModal = () => {
    switch (halfModalType) {
      case 'filter':
        return <FilterByPane />
      case 'sort':
        return <SortByPane onSortChange={value => onSortChange(value)} />
      default:
        return <Text>展示点什么</Text>
    }
  }

  return (
    <Pressable style={style.container}>
      <View>
        <IconButton icon="menu" onPress={onLeftMenuPress} />
      </View>
      <View>
        <Text style={style.title}>{options.title}</Text>
      </View>
      <View style={style.right}>
        {itemSelected > 0 && (
          <View style={style.checked}>
            {/* <Icon source="checkbox-outline" size={20} /> */}
            {/* <Text>已选</Text> */}
            <Text style={style.checkedCount}>{itemSelected}</Text>
          </View>
        )}
        {page === 'Home' && (
          <Menu
            visible={isShowRightMenu}
            onDismiss={onRightMenuClose}
            anchor={
              <IconButton
                icon={itemSelected > 0 ? 'menu-open' : 'dots-vertical'}
                size={24}
                onPress={() => setIsShowRightMenu(true)}
              />
            }>
            {itemSelected > 0 && (
              <MenuItemFroChecked
                onPress={value => onRightMenuItemPress(value)}
              />
            )}
            {itemSelected === 0 && (
              <MenuItemForNormal
                onPress={value => onRightMenuItemPress(value)}
              />
            )}
            <Divider />
            <Menu.Item
              onPress={() => setIsShowRightMenu(false)}
              title="取消"
              leadingIcon={'close'}
            />
          </Menu>
        )}
      </View>
      <HalfModal
        title={halfModalType === 'filter' ? '过滤' : '排序'}
        isShow={isShowBottomModal}
        onClosePress={onHalfModalClose}
        closed={onHalfModalClose}>
        {_showWhatModal()}
      </HalfModal>
    </Pressable>
  )
}

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6d57a7',
  },
  checked: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedCount: {
    color: '#6d57a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
})

export default Header
