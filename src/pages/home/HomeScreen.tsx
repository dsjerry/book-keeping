import { useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { AddingButton, KeepingList, NothingHere } from './components'
import { useKeepingStore, userUsersKeepingStore } from '~store/keepingStore'
import { useUserStore } from '~store/userStore'
import { homeStyle } from './style'
import { useHomeStore, useHomeStoreDispatch } from './contexts/HomeContext'
import Modal from '~components/Modal'

const HomeScreen = () => {
  const navigation = useNavigation()
  const dispatch = useHomeStoreDispatch()
  const { items, remove, toggle, addItems } = useKeepingStore()
  const { modal } = useHomeStore()
  const { currentUser, users } = useUserStore()
  const { get } = userUsersKeepingStore()

  const initData = () => {
    if (!currentUser) return

    const userKeeping = get(currentUser.id)
    if (userKeeping) {
      addItems(userKeeping.keeping)
    }
  }

  useEffect(() => {
    console.log('user', users)
    initData()
  }, [])

  return (
    <>
      <Pressable style={homeStyle.container} onPress={() => dispatch({ type: 'isShowMenu', payload: false })}>
        <KeepingList item={items} toggle={toggle} remove={remove} />
        {items.length === 0 && <NothingHere />}
        <View style={homeStyle.btnArea}>
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

export default HomeScreen
