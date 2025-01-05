import { useState, useEffect } from 'react'
import { Image } from 'react-native'
import { List, Button, TextInput, HelperText } from 'react-native-paper'
import ImagePicker from 'react-native-image-crop-picker'

import { useUserContext } from './contexts/UserContext'
import { handleImage } from '~utils'
import HalfModal from '~components/HalfModal'

type HalfModalType = 'nickname' | 'note'

const ProfileEdit = () => {
  const [isShowModal, setIsShowModal] = useState(false)
  const [halfModalType, setHalfModalType] = useState<HalfModalType>('nickname')
  const [editObj, setEditObj] = useState({ nickname: '', note: '', email: '' })
  const { userStore } = useUserContext()

  const _currentUser = userStore.currentUser!

  useEffect(() => {
    setEditObj({
      nickname: _currentUser.username,
      note: _currentUser.note || '这个人很懒，什么也没留下',
      email: _currentUser.email || '',
    })
  }, [_currentUser])

  enum HalfModalTitle {
    nickname = '个性昵称',
    note = '个性签名',
  }

  const onAvatarPress = async () => {
    try {
      const image = await handleImage({ limit: 1 })
      const uri = image ? image[0].uri : ''
      if (!uri) return

      const cropResult = await ImagePicker.openCropper({
        path: uri,
        width: 300,
        height: 300,
        mediaType: 'photo',
        cropperToolbarTitle: '图片裁剪',
      })

      if (!cropResult) return

      userStore.updateCurrentUser({ avatar: cropResult.path })
    } catch (error) {
      console.log(error)
    }
  }

  const onNicknamePress = () => {
    setIsShowModal(true)
    setHalfModalType('nickname')
  }

  const onNotePress = () => {
    setIsShowModal(true)
    setHalfModalType('note')
  }

  const onHalfModalClose = () => {
    setIsShowModal(false)
    userStore.updateCurrentUser({
      username: editObj.nickname,
      note: editObj.note,
    })
  }

  const generateUid = () => {
    userStore.updateCurrentUser({
      id: Date.now().toString(),
    })
  }

  return (
    <>
      <List.Section
        style={{
          marginTop: 20,
          paddingLeft: 10,
          width: '100%',
        }}>
        <List.Item
          title="UID"
          right={props => (
            <Button
              icon={'chevron-right'}
              textColor="grey"
              contentStyle={{ flexDirection: 'row-reverse' }}
              disabled={!!_currentUser.id}
              onPress={generateUid}>
              {_currentUser.id || '缺失, 点击分配'}
            </Button>
          )}
        />
        <List.Item
          title="个人头像"
          right={props =>
            _currentUser.avatar ? (
              <Image
                source={{
                  uri: _currentUser?.avatar,
                  width: 50,
                  height: 50,
                }}
                style={{
                  marginRight: 15,
                  borderRadius: 4,
                }}
              />
            ) : null
          }
          onPress={onAvatarPress}
        />
        <List.Item
          title="个性昵称"
          right={props => (
            <Button icon={'chevron-right'} textColor="grey" contentStyle={{ flexDirection: 'row-reverse' }}>
              {editObj.nickname}
            </Button>
          )}
          onPress={onNicknamePress}
        />
        <List.Item
          title="个性签名"
          right={props => (
            <Button icon={'chevron-right'} textColor="grey" contentStyle={{ flexDirection: 'row-reverse' }}>
              {editObj.note}
            </Button>
          )}
          onPress={onNotePress}
        />
        <List.Item
          title="邮箱"
          right={props => (
            <Button icon={'chevron-right'} textColor="grey" contentStyle={{ flexDirection: 'row-reverse' }}>
              {editObj.email}
            </Button>
          )}
        />
      </List.Section>
      <HalfModal
        isShow={isShowModal}
        onClosePress={onHalfModalClose}
        title={HalfModalTitle[halfModalType]}
        closed={onHalfModalClose}>
        {halfModalType === 'nickname' ? (
          <>
            <TextInput
              value={editObj.nickname}
              style={{
                marginTop: 10,
                borderWidth: 0,
                backgroundColor: 'transparent',
              }}
              onChangeText={text => setEditObj({ ...editObj, nickname: text })}
            />
            <HelperText style={{ marginBottom: 10, marginHorizontal: 5 }} type="info">
              设置一个你喜欢的昵称，用于账单分享显示
            </HelperText>
          </>
        ) : (
          <>
            <TextInput
              value={editObj.note}
              style={{
                marginTop: 10,
                borderWidth: 0,
                backgroundColor: 'transparent',
              }}
              onChangeText={text => setEditObj({ ...editObj, note: text })}
            />
            <HelperText style={{ marginBottom: 10, marginHorizontal: 5 }} type="info">
              个性签名在分享的时候会显示出来
            </HelperText>
          </>
        )}
      </HalfModal>
    </>
  )
}

export default ProfileEdit
