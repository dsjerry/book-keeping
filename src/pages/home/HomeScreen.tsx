import { useEffect } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

import { AddingButton, KeepingList, NothingHere } from './components'
import { useKeepingStore, userUsersKeepingStore } from '~store/keepingStore'
import { useUserStore } from '~store/userStore'
import { homeStyle } from './style'
import { useHomeStore, useHomeStoreDispatch } from './contexts/HomeContext'
import Modal from '~components/Modal'

const HomeScreen = () => {
  const theme = useTheme()
  const navigation = useNavigation()
  const dispatch = useHomeStoreDispatch()
  const { items, toggle, addItems } = useKeepingStore()
  const { modal } = useHomeStore()
  const { currentUser } = useUserStore()
  const { get } = userUsersKeepingStore()

  // 当前用户变化时（登录/切换账号）加载该用户保存的账本
  useEffect(() => {
    if (!currentUser) return
    const userKeeping = get(currentUser.id)
    if (userKeeping) {
      addItems(userKeeping.keeping)
    }
  }, [currentUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderItems = items.filter(item => item.syncStatus !== 'deleted')

  return (
    <>
      <Pressable
        style={[homeStyle.container, { backgroundColor: theme.colors.background }]}
        onPress={() => dispatch({ type: 'isShowMenu', payload: false })}>
        <View style={innerStyle.content}>
          {renderItems.length === 0 ? <NothingHere /> : <KeepingList item={renderItems} toggle={toggle} />}
        </View>
        <View style={[homeStyle.btnArea, { borderTopColor: theme.colors.outlineVariant }]}>
          <AddingButton onPress={() => navigation.navigate('Adding', {})} />
        </View>
      </Pressable>
      {/* 提示框 */}
      <Modal
        title={modal.title}
        content={modal.body}
        visible={modal.isShow}
        onCancel={modal.onCancel}
        onAccess={modal.onAccess}
      />
    </>
  )
}

const innerStyle = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
})

export default HomeScreen
