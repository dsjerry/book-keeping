import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { List, Switch, RadioButton, useTheme, Text } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { Snackbar } from 'react-native-paper'

import { useAppSettingsStore } from '~store/settingStore'
import { useUserStore } from '~store/userStore'
import { useKeepingStore } from '~store/keepingStore'
import CustomDialog from '~components/CustomDialog'
import Modal from '~components/Modal'
import { _COLORS } from '~consts/Colors'
import { OutTypes } from '~consts/Data'
import { AuthService } from '~api/auth'
import { logging } from '~utils'

const Settings = () => {
  const [isShowDialog, setIsShowDialog] = useState(false)
  const [tips, setTips] = useState('')
  const [switchStatus, setSwitchStatus] = useState({
    del: false,
    exit: false,
  })

  const [modal, setModal] = useState({
    title: '',
    body: '',
    isShow: false,
    onCancel: () => { },
    onAccess: () => { },
  })

  const [clearConfirm, setClearConfirm] = useState(0)
  const {
    useOnline,
    confirmExitEdit,
    confirmRemove,
    themeMode,
    toggleUseOnline,
    toggleConfirmExitEdit,
    toggleConfirmRemove,
    setThemeMode,
  } = useAppSettingsStore()

  const { currentUser, updateCurrentUser } = useUserStore()
  const { items } = useKeepingStore()
  const theme = useTheme()

  const navigation = useNavigation()

  useEffect(() => {
    setSwitchStatus({
      del: confirmRemove,
      exit: confirmExitEdit,
    })
  }, [])

  const clearCache = () => {
    setClearConfirm(prev => prev + 1)
    if (clearConfirm === 2) {
      setClearConfirm(0)
    }
  }

  const onDismissSnackBar = () => {
    setTips('')
  }

  interface SwitchParams {
    type: keyof typeof switchStatus
    flag: boolean
  }
  const onSwitchPress = ({ type, flag }: SwitchParams) => {
    setSwitchStatus(prev => ({ ...prev, [type]: flag }))

    switch (type) {
      case 'del':
        toggleConfirmRemove()
        break
      case 'exit':
        toggleConfirmExitEdit()
        break
    }
  }

  const handleUpdatePress = () => {
    setIsShowDialog(true)
    // TODO
    setTimeout(() => {
      setIsShowDialog(false)
      setTips('暂无更新！')
    }, 2000)
  }

  const fixData = () => {
    console.info('数据完善...')
    console.log(currentUser)
    if (!currentUser) return console.info('用户不存在')

    if (!currentUser.tags || currentUser.tags.length === 0) {
      console.info('添加标签')
      updateCurrentUser({ tags: OutTypes })
    }

    const noInclude = (arr: string[]) => {
      return !arr.some(
        item => item === 'cny' || item === 'hkd' || item === 'aud',
      )
    }
    items.forEach(item => {
      if (noInclude(item.useToFilter)) {
        if (item.countType === '人民币') {
          item.useToFilter.push('cny')
        } else if (item.countType === '港币') {
          item.useToFilter.push('hkd')
        } else if (item.countType === '澳元') {
          item.useToFilter.push('aud')
        }
      }
    })

    console.info('完善完成...')
  }

  const onUseOnlinePress = (flag: boolean) => {
    if (currentUser?.serverId) {
      toggleUseOnline()
    } else {
      setModal({
        title: '用户未启用同步功能',
        body: '此操作将会使用你的用户名和密码登录服务器，是否继续？',
        isShow: true,
        onCancel: () => setModal({ ...modal, isShow: false }),
        onAccess: () => {
          if (!currentUser) return logging.info('用户不存在')
          const { username, password } = currentUser
          AuthService.signup({ username, password, password2: password }).then(res => {
            if (res.success) {
              setTips('同步功能已启用')
              setModal({ ...modal, isShow: false })
              updateCurrentUser({ serverId: res.data.id })
              toggleUseOnline()
            }
          })
        },
      })
    }
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        {isShowDialog && (
          <CustomDialog
            title="加载中"
            onBackdropPress={() => setIsShowDialog(false)}
          />
        )}
        <Snackbar
          visible={tips !== ''}
          onDismiss={onDismissSnackBar}
          rippleColor={_COLORS.main}
          duration={2500}
          style={{ marginTop: 'auto', backgroundColor: _COLORS.main }}>
          {tips}
        </Snackbar>
        <List.Section title="基本设置">
          <List.Accordion
            title="主题设置"
            description="设置应用的显示主题"
            descriptionStyle={{ fontSize: 12 }}
            style={{ backgroundColor: theme.colors.surfaceVariant }}
            left={props => (
              <List.Icon {...props} icon="theme-light-dark" />
            )}>
            <RadioButton.Group
              onValueChange={value => setThemeMode(value as 'system' | 'light' | 'dark')}
              value={themeMode}>
              <RadioButton.Item
                label="跟随系统"
                value="system"
                labelStyle={{ color: theme.colors.onSurface }}
              />
              <RadioButton.Item
                label="浅色模式"
                value="light"
                labelStyle={{ color: theme.colors.onSurface }}
              />
              <RadioButton.Item
                label="深色模式"
                value="dark"
                labelStyle={{ color: theme.colors.onSurface }}
              />
            </RadioButton.Group>
          </List.Accordion>
          <List.Accordion
            title="再次确认"
            description="执行操作时再次询问"
            descriptionStyle={{ fontSize: 12 }}
            style={{ backgroundColor: theme.colors.surfaceVariant }}
            left={props => (
              <List.Icon {...props} icon="alert-circle-check-outline" />
            )}>
            <List.Item
              title="删除记录"
              left={props => <List.Icon {...props} icon="delete" />}
              onPress={() => console.log('Pressed')}
              right={props => (
                <Switch
                  value={switchStatus.del}
                  onValueChange={value =>
                    onSwitchPress({ type: 'del', flag: value })
                  }
                />
              )}
            />
            <List.Item
              title="退出编辑"
              left={props => <List.Icon {...props} icon="exit-to-app" />}
              onPress={() => console.log('Pressed')}
              right={props => (
                <Switch
                  value={switchStatus.exit}
                  onValueChange={value =>
                    onSwitchPress({ type: 'exit', flag: value })
                  }
                />
              )}
            />
          </List.Accordion>
          <List.Item
            title="启用同步"
            left={props => <List.Icon {...props} icon="cloud-upload-outline" />}
            right={() => (
              <Switch value={useOnline} onValueChange={onUseOnlinePress} />
            )}
          />
          <List.Item
            title="清除缓存"
            left={props => <List.Icon {...props} icon="delete-forever-outline" />}
            description={clearConfirm == 1 ? '再次点击清除' : undefined}
            right={props =>
              clearConfirm === 1 && (
                <List.Icon
                  {...props}
                  icon="alert-circle-outline"
                  color="darkred"
                />
              )
            }
            onPress={clearCache}
          />
        </List.Section>
        <List.Section title="关于软件">
          <List.Item
            title="检测更新"
            left={props => <List.Icon {...props} icon="update" />}
            onPress={() => handleUpdatePress()}
          />
          <List.Item
            title="软件信息"
            left={props => <List.Icon {...props} icon="information-outline" />}
            onPress={() => navigation.navigate('AboutScreen', {})}
          />
        </List.Section>
        <List.Section title="开发">
          <List.Item
            title="数据修复"
            left={props => <List.Icon {...props} icon="auto-fix" />}
            onPress={fixData}
          />
        </List.Section>
      </View>
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

export default Settings
