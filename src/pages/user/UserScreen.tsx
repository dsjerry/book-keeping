import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { IconButton, List, Snackbar, RadioButton } from 'react-native-paper'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'

import { useUserContext } from './contexts/UserContext'
import { useUserStore } from '~store/userStore'
import { useAppSettingsStore } from '~store/settingStore'
import NoUser from './widgets/NoUser'
import Modal from '~components/Modal'
import LoadingIndicator from '~components/LoadingIndicator'
import { AuthService } from '~api/auth'
import { UserService } from '~api/user'
import { KeepingService } from '~api/keeping'

import { logging } from '~utils'

interface UserHomeProps {
  route?: ScreenParam.User
}

interface UserCardProps {
  user: User
  data: {
    record: number
    output: number
    income: number
  }
}

const UserCard: React.FC<UserCardProps> = ({ user, data }) => {
  const shareRef = useRef<any>(null)

  const onShare = async () => {
    try {
      const uri = await captureRef(shareRef.current, {
        format: 'png',
        quality: 0.8,
      })

      const shareOptions = {
        title: '分享到',
        url: uri,
        failOnCancel: false,
      }

      await Share.open(shareOptions)
    } catch (error) {
      console.error('捕获失败:', error)
    }
  }

  return (
    <LinearGradient
      ref={shareRef}
      colors={['#6750a4', '#a89ac7', '#e7e0ec']}
      style={card.container}>
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 20,
        }}>
        <View style={{ flex: 2 }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 4,
              backgroundColor: '#e7e0ec',
            }}>
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 60, height: 60, borderRadius: 4 }}
              />
            ) : (
              ''
            )}
          </View>
        </View>
        <View style={{ flex: 6, justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#e7e0ec' }}>
            {user.username || '飞翔的企鹅'}
          </Text>
          <Text style={{ color: '#e7e0ec' }}>UID: {user.id || '123456'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <IconButton
            icon={'share-outline'}
            iconColor="#a89ac7"
            onPress={onShare}
          />
        </View>
      </View>
      <View style={{ paddingVertical: 20 }}>
        <Text style={{ color: '#e7e0ec' }}>
          {user.note || '这家伙很懒，什么也没留下~'}
        </Text>
      </View>
      <View style={card.countPane}>
        <View style={card.countItem}>
          <Text style={card.countNum}>{data.record}</Text>
          <Text style={{ color: '#6750a4' }}>记录</Text>
        </View>
        <View style={card.countItem}>
          <Text style={card.countNum}>{data.output}</Text>
          <Text style={{ color: '#6750a4' }}>支出</Text>
        </View>
        <View style={card.countItem}>
          <Text style={card.countNum}>{data.income}</Text>
          <Text style={{ color: '#6750a4' }}>收入</Text>
        </View>
      </View>
    </LinearGradient>
  )
}

const UserHome: React.FC<UserHomeProps> = ({ route }) => {
  const navigation = useNavigation()

  const { keepingStore } = useUserContext()
  const { toggleUseOnline } = useAppSettingsStore()
  const { currentUser, updateCurrentUser } = useUserStore()

  const { setCounting, record, output, income } = keepingStore

  const [modal, setModal] = useState({
    title: '',
    body: '' as string | React.JSX.Element,
    isShow: false,
    onCancel: () => { },
    onAccess: () => { },
  })

  const [tips, setTips] = useState('')
  const [loading, setLoading] = useState(false)
  const [strategy, setStrategy] = useState('')

  const isRegOnline = currentUser?.serverId

  const startSync = (serverId?: number) => {
    setModal({ ...modal, isShow: false })
    serverId && updateCurrentUser({ serverId })
    toggleUseOnline()
    setTips('同步功能已启用')

    setLoading(true)
    
    const StrategyRadio = () => {
      return (
        <View>
          {['client', 'server', 'merge'].map(item => {
            return <RadioButton value={item}  onPress={() => setStrategy(item)}/>
          })}
        </View>
      )
    }

    KeepingService.sync().then((res) => {
      if (res.success) {
        const conflicts = res.data?.conflicts
        if (conflicts && conflicts?.length !== 0) {
          setModal({
            title: '冲突',
            body: (
              <View>
                <StrategyRadio/>
              </View>
            ),
            isShow: true,
            onCancel: () => setModal({ ...modal, isShow: false }),
            onAccess: () => {
              if (!strategy) {
                return setTips('请选择解决方式！')
              }
              const resolutions = KeepingService.resolveConflicts(conflicts, strategy as 'client' | 'server' | 'merge')
              KeepingService.sync(resolutions).then((res) => {
                if (res.success) {
                  setTips('冲突解决成功')
                  setModal({ ...modal, isShow: false })
                } else {
                  setTips('冲突解决失败')
                }
                setLoading(false)
              })
            },
          })
        } else {
          setTips('同步成功')
        }
      } else {
        setTips('同步失败')
      }
    }).finally(() => setLoading(false))
  }

  const onSyncPress = () => {
    if (!isRegOnline) {
      setModal({
        title: '用户未启用同步功能',
        body: '此操作将会使用你的用户名和密码登录服务器，是否继续？',
        isShow: true,
        onCancel: () => setModal({ ...modal, isShow: false }),
        onAccess: async () => {
          if (!currentUser) return logging.info('用户不存在')
          const { username, password } = currentUser

          const { data, success } = await UserService.getUserByName(username)
          if (!success) {
            setTips('同步失败')
            return
          }
          const userId = data.id
          if (userId) return startSync(userId)
          AuthService.signup({ username, password, password2: password }).then(res => {
            if (res.success) {
              startSync(res.data.id)
            }
          })
        },
      })
    }
    else {
      startSync()
    }
  }

  useEffect(() => {
    setCounting()
  }, [navigation])

  return (
    <View style={style.container}>
      {!currentUser ? (
        <NoUser />
      ) : (
        <>
          <UserCard user={currentUser} data={{ record, output, income }} />
          <List.Section style={{
            marginTop: 20,
            paddingHorizontal: 10,
            width: '90%',
            elevation: 4,
            borderRadius: 4,
            backgroundColor: '#e6dfec',
          }} >
            <List.Item
              title="额度设置"
              left={props => (
                <List.Icon {...props} icon="counter" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                navigation.navigate('ProfileEditScreen', {})
                navigation.setOptions({ headerShown: false })
              }}
            />
            <List.Item
              title="API KEY"
              left={props => (
                <List.Icon {...props} icon="file-key-outline" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </List.Section>
          <List.Section
            style={{
              marginTop: 20,
              paddingHorizontal: 10,
              width: '90%',
              elevation: 4,
              borderRadius: 4,
              backgroundColor: '#e6dfec',
            }}>
            <List.Item
              title="编辑信息"
              left={props => (
                <List.Icon {...props} icon="account-edit-outline" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                navigation.navigate('ProfileEditScreen', {})
                navigation.setOptions({ headerShown: false })
              }}
            />
            <List.Item
              title="类型管理"
              left={props => (
                <List.Icon {...props} icon="format-list-bulleted-type" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('AddTagsScreen', {})}
            />
            <List.Item
              title="数据管理"
              left={props => (
                <List.Icon {...props} icon="database-search-outline" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="立即同步"
              left={props => (
                <List.Icon {...props} icon="cloud-upload-outline" />
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={onSyncPress}
            />
          </List.Section>
        </>
      )}
      <Snackbar
        visible={tips !== ''}
        onDismiss={() => setTips('')}
        action={{
          label: '确定',
          onPress: () => {
            setTips('')
          },
        }}>
        {tips}
      </Snackbar>
      <Modal
        visible={modal.isShow}
        onCancel={modal.onCancel}
        onAccess={modal.onAccess}
        title={modal.title}
        content={modal.body}
      />
      <LoadingIndicator text='同步中...' animating={loading} />
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
})

const card = StyleSheet.create({
  container: {
    width: '90%',
    height: 350,
    marginTop: 20,
    elevation: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  countPane: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 10,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countNum: {
    marginRight: 5,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6750a4',
  },
})

export default UserHome
