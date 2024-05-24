import { useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { IconButton, Menu, Divider } from 'react-native-paper'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'

import type { StackHeaderProps } from '@react-navigation/stack'

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

interface HeaderProps extends StackHeaderProps {
  menu?: MenuItem
  toggleDrawer?: () => void
}
export type RightMenuItem = 'sort' | 'filter' | 'all' | 'invert' | 'delete'

const Header: React.FC<HeaderProps> = ({
  route,
  navigation,
  options,
  toggleDrawer,
}) => {
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

  // 子页面（不在 AppLayout 里面的）路由，自定义软件头
  const _header = useMemo<{
    title: string | undefined
    type: 'back' | 'menu'
  }>(() => {
    const routeName = () => {
      const name = getFocusedRouteNameFromRoute(route) ?? 'Home'
      return name as keyof ScreenParamsList
    }

    const _name = routeName()
    console.log('路由:', _name)

    switch (_name) {
      case 'ProfileEditScreen':
        return { title: '编辑信息', type: 'back' }
      case 'LoginScreen':
        return { title: '登录 / 注册', type: 'back' }
      case 'AboutScreen':
        return { title: '关于', type: 'back' }
      case 'AddTagsScreen':
        return { title: '编辑标签', type: 'back' }
      default:
        return { title: options.title, type: 'menu' }
    }
  }, [route])

  const page = route.name

  const itemSelected = items.filter(item => item.isChecked).length

  const setIsShowRightMenu = (flag: boolean) => {
    dispatch({ type: 'isShowRightMenu', payload: flag })
  }
  const setIsShowBottomModal = (flag: boolean) => {
    dispatch({ type: 'isShowBottomModal', payload: flag })
  }

  const onLeftMenuPress = () => toggleDrawer && toggleDrawer()
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
        {_header.type === 'back' ? (
          <IconButton
            icon={'chevron-left'}
            onPress={() => navigation.goBack()}
          />
        ) : (
          <IconButton icon="menu" onPress={onLeftMenuPress} />
        )}
      </View>
      <View>
        <Text style={style.title}>{_header.title}</Text>
      </View>
      <View style={style.right}>
        {itemSelected > 0 && (
          <View style={style.checked}>
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
    // backgroundColor: '#e7e0ec',
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
