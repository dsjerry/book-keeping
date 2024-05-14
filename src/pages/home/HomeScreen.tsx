import { useState } from 'react'
import { View, Pressable, Button, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { AddingButton, KeepingList, NothingHere } from './components'
import { useKeepingStore } from '~store/keepingStore'
import { homeStyle } from './style'
import { useHomeStore, useHomeStoreDispatch } from './contexts/HomeContext'
import Modal from '~components/Modal'

const HomeScreen = () => {
  const navigation = useNavigation()
  const dispatch = useHomeStoreDispatch()
  const { items, remove, toggle } = useKeepingStore()
  const { isShowModal, modalTitle, modalBody, activeKeeping } = useHomeStore()

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
        {items.length === 0 && <NothingHere />}
        <View style={homeStyle.btnArea}>
          <AddingButton onPress={() => navigation.navigate('Adding', {})} />
        </View>
      </Pressable>
      {/* 提示框 */}
      <Modal
        title={modalTitle}
        content={modalBody}
        visible={isShowModal}
        onCancel={doModalCancel}
        onAccess={doModalAccess}
      />
    </>
  )
}

export default HomeScreen
