import { useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { IconButton, Menu, Divider, useTheme } from 'react-native-paper'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { StackHeaderProps } from '@react-navigation/stack'

import HalfModal from '~components/HalfModal'
import { useKeepingStore } from '~store/keepingStore'
import { logging } from '~utils'
import { SortByPane, FilterByPane, MenuItemFroChecked, MenuItemForNormal } from './widgets'
import { useHeaderContext } from '../contexts/HeaderContext'

interface HeaderProps extends StackHeaderProps {
  menu?: MenuItem
  toggleDrawer?: () => void
}
export type RightMenuItem = 'sort' | 'filter' | 'all' | 'invert' | 'delete'

const Header: React.FC<HeaderProps> = ({ route, navigation, options, toggleDrawer }) => {
  const insets = useSafeAreaInsets()
  // 获取当前主题
  const theme = useTheme()
  const { items, sort, sortBy, sortOrder, filterBy, filter, selectAll, selectInverse, removeChecked } =
    useKeepingStore()
  const {
    state: { isShowRightMenu, isShowBottomModal, halfModalType },
    dispatch,
  } = useHeaderContext()

  // 子页面（不在 AppLayout 里面的）路由，自定义软件头
  const _name = (getFocusedRouteNameFromRoute(route) ?? 'Home') as keyof ScreenParamsList

  const _header = useMemo<{
    title: string | undefined
    type: 'back' | 'menu'
  }>(() => {
    switch (_name) {
      case 'ProfileEditScreen':
        return { title: '编辑信息', type: 'back' }
      case 'AboutScreen':
        return { title: '关于', type: 'back' }
      case 'AddTagsScreen':
        return { title: '编辑标签', type: 'back' }
      case 'BudgetSettings':
        return { title: '额度设置', type: 'back' }
      case 'ApiSettings':
        return { title: 'API 设置', type: 'back' }
      case 'DataManagement':
        return { title: '数据管理', type: 'back' }
      case 'PermissionScreen':
        return { title: '权限管理', type: 'back' }
      case 'LicensesScreen':
        return { title: '开源许可', type: 'back' }
      default:
        return { title: options.title, type: 'menu' }
    }
  }, [_name])

  // 登录/注册页采用全屏沉浸式布局，不展示顶部导航栏
  if (_name === 'LoginScreen') return null

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
    <Pressable
      style={[
        style.container,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.elevation.level5,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}>
      <View>
        {_header.type === 'back' ? (
          <IconButton icon={'chevron-left'} onPress={() => navigation.goBack()} />
        ) : (
          <IconButton icon="menu" onPress={onLeftMenuPress} />
        )}
      </View>
      <View>
        <Text style={[style.title, { color: theme.colors.primary }]}>{_header.title}</Text>
      </View>
      <View style={style.right}>
        {itemSelected > 0 && (
          <View style={style.checked}>
            <Text style={[style.checkedCount, { color: theme.colors.primary }]}>{itemSelected}</Text>
          </View>
        )}
        {page === 'Home' && (
          <Menu
            visible={isShowRightMenu}
            onDismiss={onRightMenuClose}
            statusBarHeight={insets.top}
            anchor={
              <IconButton
                icon={itemSelected > 0 ? 'menu-open' : 'dots-vertical'}
                size={24}
                onPress={() => setIsShowRightMenu(true)}
              />
            }>
            {itemSelected > 0 && <MenuItemFroChecked onPress={value => onRightMenuItemPress(value)} />}
            {itemSelected === 0 && <MenuItemForNormal onPress={value => onRightMenuItemPress(value)} />}
            <Divider />
            <Menu.Item onPress={() => setIsShowRightMenu(false)} title="取消" leadingIcon={'close'} />
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
    // 颜色将通过主题动态设置
  },
  checked: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedCount: {
    // 颜色将通过主题动态设置
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
})

export default Header
