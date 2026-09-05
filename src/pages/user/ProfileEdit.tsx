import { useState, useEffect } from 'react'
import { Image, ScrollView, View, Text, Pressable } from 'react-native'
import { List, TextInput, HelperText, useTheme } from 'react-native-paper'
import ImagePicker from 'react-native-image-crop-picker'

import { useUserContext } from './contexts/UserContext'
import { handleImage, logging } from '~utils'
import HalfModal from '~components/HalfModal'
import { KeepingService } from '~api/keeping'
import { Auth } from '~api/auth'
import http from '~utils/http'
import { useAppSettingsStore } from '~store/settingStore'

type HalfModalType = 'nickname' | 'note'

const ProfileEdit = () => {
  const theme = useTheme()
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

      // 启用同步且已登录时上传头像，换取跨设备可访问的服务端地址；失败回退本地路径
      let avatar = cropResult.path
      const token = await Auth.getToken()
      const { useOnline } = useAppSettingsStore.getState()
      if (useOnline && token?.access_token) {
        const uploaded = await KeepingService.uploadImage(cropResult.path)
        if (uploaded) {
          avatar = uploaded
          // 同步到服务端用户资料（失败不影响本地头像更新）
          if (_currentUser.serverId) {
            await http.patch(`/user/${_currentUser.serverId}`, { avatar }).catch(() => null)
          }
        }
      }
      userStore.updateCurrentUser({ avatar })
    } catch (error) {
      logging.error('[头像] 裁剪失败:', error)
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

  const renderValueRow = (value: string, disabled = false, onPress?: () => void) => (
    <Pressable onPress={onPress} disabled={disabled} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text
        style={{
          color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurfaceVariant,
          marginRight: 4,
          fontSize: 14,
        }}
        numberOfLines={1}>
        {value}
      </Text>
      <List.Icon icon="chevron-right" />
    </Pressable>
  )

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
        <List.Section
          style={{
            marginTop: 20,
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceVariant,
          }}>
          <List.Item
            title="UID"
            left={props => <List.Icon {...props} icon="account-key-outline" />}
            right={props => renderValueRow(_currentUser.id || '缺失, 点击分配', !!_currentUser.id, generateUid)}
          />
          <List.Item
            title="个人头像"
            left={props => <List.Icon {...props} icon="account-circle-outline" />}
            right={props =>
              _currentUser.avatar ? (
                <Image
                  source={{ uri: _currentUser.avatar, width: 50, height: 50 }}
                  style={{ borderRadius: 12, marginRight: 4 }}
                />
              ) : (
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: theme.colors.tertiaryContainer,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 4,
                  }}>
                  <Text style={{ color: theme.colors.onTertiaryContainer, fontSize: 20, fontWeight: '700' }}>
                    {(_currentUser.username || '?').substring(0, 1).toUpperCase()}
                  </Text>
                </View>
              )
            }
            onPress={onAvatarPress}
          />
          <List.Item
            title="个性昵称"
            left={props => <List.Icon {...props} icon="badge-account-outline" />}
            right={props => renderValueRow(editObj.nickname, false, onNicknamePress)}
          />
          <List.Item
            title="个性签名"
            left={props => <List.Icon {...props} icon="text-box-outline" />}
            right={props => renderValueRow(editObj.note, false, onNotePress)}
          />
          <List.Item
            title="邮箱"
            left={props => <List.Icon {...props} icon="email-outline" />}
            right={props => renderValueRow(editObj.email)}
          />
        </List.Section>
      </ScrollView>
      <HalfModal
        isShow={isShowModal}
        onClosePress={onHalfModalClose}
        title={HalfModalTitle[halfModalType]}
        closed={onHalfModalClose}>
        {halfModalType === 'nickname' ? (
          <>
            <TextInput
              mode="outlined"
              value={editObj.nickname}
              style={{ marginTop: 10 }}
              outlineStyle={{ borderRadius: 12 }}
              onChangeText={text => setEditObj({ ...editObj, nickname: text })}
            />
            <HelperText style={{ marginBottom: 10, marginHorizontal: 5 }} type="info">
              设置一个你喜欢的昵称，用于账单分享显示
            </HelperText>
          </>
        ) : (
          <>
            <TextInput
              mode="outlined"
              value={editObj.note}
              style={{ marginTop: 10 }}
              outlineStyle={{ borderRadius: 12 }}
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
