import { Platform, View, Text } from 'react-native'
import { MenuView } from '@react-native-menu/menu'
import type { MenuAction, NativeActionEvent } from '@react-native-menu/menu'

interface Props {
  // 长按子组件时自动根据子组件位置弹出菜单。但是没有办法拿到子组件
  children: React.ReactNode
  // 菜单选项
  actions: MenuAction[]
  onPress: (id: string) => void
}
const CustomMenuView: React.FC<Props> = ({ children, actions, onPress }) => {
  const _action = actions || defaultActions

  const onMenuItemPress = ({ nativeEvent }: NativeActionEvent) => {
    // console.warn(JSON.stringify(nativeEvent))
    const actionId = nativeEvent.event
    onPress(actionId)
  }

  return (
    <MenuView
      isAnchoredToRight={true}
      actions={_action}
      shouldOpenOnLongPress={true}
      onPressAction={e => onMenuItemPress(e)}>
      {children}
    </MenuView>
  )
}

const defaultActions: MenuAction[] = [
  {
    id: 'add',
    title: 'Add',
    titleColor: '#2367A2',
    image: Platform.select({
      ios: 'plus',
      android: 'ic_menu_add',
    }),
    imageColor: '#2367A2',
    subactions: [
      {
        id: 'nested1',
        title: 'Nested action',
        titleColor: 'rgba(250,180,100,0.5)',
        subtitle: 'State is mixed',
        image: Platform.select({
          ios: 'heart.fill',
          android: 'ic_menu_today',
        }),
        imageColor: 'rgba(100,200,250,0.3)',
        state: 'mixed',
      },
      {
        id: 'nestedDestructive',
        title: 'Destructive Action',
        attributes: {
          destructive: true,
        },
        image: Platform.select({
          ios: 'trash',
          android: 'ic_menu_delete',
        }),
      },
    ],
  },
  {
    id: 'share',
    title: 'Share Action',
    titleColor: '#46F289',
    subtitle: 'Share action on SNS',
    image: Platform.select({
      ios: 'square.and.arrow.up',
      android: 'ic_menu_share',
    }),
    imageColor: '#46F289',
    state: 'on',
  },
  {
    id: 'destructive',
    title: 'Destructive Action',
    attributes: {
      destructive: true,
    },
    image: Platform.select({
      ios: 'trash',
      android: 'ic_menu_delete',
    }),
  },
]

export default CustomMenuView
