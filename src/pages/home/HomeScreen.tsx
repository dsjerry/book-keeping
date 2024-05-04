import { useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { AddingButton, KeepingList } from './components'
import { useKeepingStore } from '~hooks/useStore'
import { homeStyle } from './style'
import { useHomeStore, useHomeStoreDispatch } from './contexts/HomeContext'
import Modal from '~components/Modal'

const HomeScreen = () => {
  const navigation = useNavigation()
  const dispatch = useHomeStoreDispatch()
  const { items, remove, toggle, load } = useKeepingStore()
  const { isShowModal, activeKeeping } = useHomeStore()

  // useEffect(() => {
  //   load()
  // }, [])

  const doModalCancel = () => dispatch({ type: 'isShowModal', payload: false })
  const doModalAccess = () => {
    activeKeeping.forEach(id => remove(id))
    dispatch({ type: 'isShowModal', payload: false })
  }

  return (
    <>
      <Pressable
        style={homeStyle.container}
        onPress={() => dispatch({ type: 'isShowMenu', payload: false })}>
        <KeepingList item={items} toggle={toggle} />
        <View style={homeStyle.btnArea}>
          {/* 不知道为啥它接收 never */}
          <AddingButton
            onPress={() => navigation.navigate('Adding' as never)}
          />
        </View>
      </Pressable>
      {/* 提示框 */}
      <Modal
        visible={isShowModal}
        onCancel={doModalCancel}
        onAccess={doModalAccess}
      />
    </>
  )
}

export default HomeScreen
