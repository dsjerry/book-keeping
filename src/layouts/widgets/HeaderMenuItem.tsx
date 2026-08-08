import React from 'react'
import { Menu } from 'react-native-paper'
import type { RightMenuItem } from '../Header'

type MenuItemProps = {
  onPress: (item: RightMenuItem) => void
}

export const MenuItemForNormal: React.FC<MenuItemProps> = ({ onPress }) => {
  return (
    <>
      <Menu.Item onPress={() => onPress('filter')} title="过滤" leadingIcon={'filter'} />
      <Menu.Item onPress={() => onPress('sort')} title="排序" leadingIcon={'sort'} />
    </>
  )
}

export const MenuItemFroChecked: React.FC<MenuItemProps> = ({ onPress }) => {
  return (
    <>
      <Menu.Item title="全选" leadingIcon={'select-all'} onPress={() => onPress('all')} />
      <Menu.Item title="反选" leadingIcon={'vector-selection'} onPress={() => onPress('invert')} />
      <Menu.Item title="删除" leadingIcon={'delete-forever-outline'} onPress={() => onPress('delete')} />
    </>
  )
}

export const MenuItemForAnalyze: React.FC<MenuItemProps> = ({ onPress }) => {
  return (
    <>
      <Menu.Item title="全部" leadingIcon={'calendar-range'} onPress={() => onPress('time-all')} />
      <Menu.Item title="本月" leadingIcon={'calendar-month'} onPress={() => onPress('time-month')} />
      <Menu.Item title="本周" leadingIcon={'calendar-week'} onPress={() => onPress('time-week')} />
      <Menu.Item title="今日" leadingIcon={'calendar-today'} onPress={() => onPress('time-day')} />
    </>
  )
}
