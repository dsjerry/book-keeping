import { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native'
import { IconButton, List, Snackbar, RadioButton, useTheme } from 'react-native-paper'
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

import { logging, withAlpha } from '~utils'

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
  const theme = useTheme()

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
      logging.error('[分享] 捕获失败:', error)
    }
  }

  const gradientColors = [
    theme.colors.primary,
    withAlpha(theme.colors.primary, 0.5),
    withAlpha(theme.colors.primary, 0.2),
  ]
  const textLight = theme.colors.onPrimary
  const textDark = theme.colors.onSurface

  return (
    <LinearGradient ref={shareRef} colors={gradientColors as [string, string, string]} style={card.container}>
      {/* 装饰性背景圆 - 右上角半透明水印，金融卡片质感 */}
      <View style={card.decorCircle} pointerEvents="none" />

      {/* 顶部行: 头像 + 用户名/UID + 分享按钮 */}
      <View style={card.topRow}>
        <View style={card.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={card.avatarImage} />
          ) : (
            <Text style={[card.avatarText, { color: textLight }]}>
              {(user.username || '飞')?.substring(0, 1).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={card.userInfo}>
          <Text style={[card.username, { color: textLight }]}>{user.username || '飞翔的企鹅'}</Text>
          <Text style={[card.uid, { color: textLight }]}>UID: {user.id || '123456'}</Text>
        </View>
        <IconButton icon="share-outline" iconColor={textLight} onPress={onShare} />
      </View>

      {/* 个性签名 */}
      <View style={card.noteArea}>
        <Text style={[card.noteText, { color: textLight }]}>{user.note || '这家伙很懒，什么也没留下~'}</Text>
      </View>

      {/* 统计面板 - 三等分等宽 + 竖排数字/标签 + 细分隔线 */}
      <View style={[card.countPane, { backgroundColor: theme.colors.surface, borderRadius: 12, paddingVertical: 12 }]}>
        <View style={card.countCol}>
          <Text style={[card.countNum, { color: textDark }]}>{data.record}</Text>
          <Text style={[card.countLabel, { color: theme.colors.onSurfaceVariant }]}>记录</Text>
        </View>
        <View style={[card.countDivider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={card.countCol}>
          <Text style={[card.countNum, { color: textDark }]}>{data.output}</Text>
          <Text style={[card.countLabel, { color: theme.colors.onSurfaceVariant }]}>支出</Text>
        </View>
        <View style={[card.countDivider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={card.countCol}>
          <Text style={[card.countNum, { color: textDark }]}>{data.income}</Text>
          <Text style={[card.countLabel, { color: theme.colors.onSurfaceVariant }]}>收入</Text>
        </View>
      </View>
    </LinearGradient>
  )
}

const UserHome: React.FC<UserHomeProps> = ({ route }) => {
  const navigation = useNavigation()
  const theme = useTheme()

  const { keepingStore } = useUserContext()
  const { toggleUseOnline } = useAppSettingsStore()
  const { currentUser, updateCurrentUser } = useUserStore()

  const { setCounting, record, output, income } = keepingStore

  const [modal, setModal] = useState({
    title: '',
    body: '' as string | React.JSX.Element,
    isShow: false,
    onCancel: () => {},
    onAccess: () => {},
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
            return <RadioButton value={item} onPress={() => setStrategy(item)} />
          })}
        </View>
      )
    }

    KeepingService.sync()
      .then(res => {
        if (res.success) {
          const conflicts = res.data?.conflicts
          if (conflicts && conflicts?.length !== 0) {
            setModal({
              title: '冲突',
              body: (
                <View>
                  <StrategyRadio />
                </View>
              ),
              isShow: true,
              onCancel: () => setModal({ ...modal, isShow: false }),
              onAccess: () => {
                if (!strategy) {
                  return setTips('请选择解决方式！')
                }
                const resolutions = KeepingService.resolveConflicts(
                  conflicts,
                  strategy as 'client' | 'server' | 'merge',
                )
                KeepingService.sync(resolutions).then(res => {
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
      })
      .finally(() => setLoading(false))
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
    } else {
      startSync()
    }
  }

  useEffect(() => {
    setCounting()
  }, [navigation])

  return (
    <View style={[style.container, { backgroundColor: theme.colors.background }]}>
      {!currentUser ? (
        <NoUser />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={style.scrollContent}>
          <UserCard user={currentUser} data={{ record, output, income }} />
          <List.Section
            style={{
              marginTop: 20,
              borderRadius: 12,
              backgroundColor: theme.colors.surfaceVariant,
            }}>
            <List.Item
              title="额度设置"
              left={props => <List.Icon {...props} icon="counter" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                navigation.navigate('ProfileEditScreen', {})
                navigation.setOptions({ headerShown: false })
              }}
            />
            <List.Item
              title="API KEY"
              left={props => <List.Icon {...props} icon="file-key-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </List.Section>
          <List.Section
            style={{
              marginTop: 20,
              borderRadius: 12,
              backgroundColor: theme.colors.surfaceVariant,
            }}>
            <List.Item
              title="编辑信息"
              left={props => <List.Icon {...props} icon="account-edit-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                navigation.navigate('ProfileEditScreen', {})
                navigation.setOptions({ headerShown: false })
              }}
            />
            <List.Item
              title="类型管理"
              left={props => <List.Icon {...props} icon="format-list-bulleted-type" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('AddTagsScreen', {})}
            />
            <List.Item
              title="数据管理"
              left={props => <List.Icon {...props} icon="database-search-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="立即同步"
              left={props => <List.Icon {...props} icon="cloud-upload-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={onSyncPress}
            />
          </List.Section>
        </ScrollView>
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
      <LoadingIndicator text="同步中..." animating={loading} />
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
})

const card = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  uid: {
    fontSize: 13,
    marginTop: 2,
  },
  noteArea: {
    paddingVertical: 20,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  countPane: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  countCol: {
    flex: 1,
    alignItems: 'center',
  },
  countDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
  },
  countNum: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  countLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 2,
  },
})

export default UserHome
