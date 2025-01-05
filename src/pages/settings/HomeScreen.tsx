import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { List, Switch } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { Snackbar } from 'react-native-paper'

import { useAppSettingsStore } from '~store/settingStore'
import { useUserStore } from '~store/userStore'
import { useKeepingStore } from '~store/keepingStore'
import CustomDialog from '~components/CustomDialog'
import { _COLORS } from '~consts/Colors'
import { OutTypes } from '~consts/Data'

const Settings = () => {
  const [isShowDialog, setIsShowDialog] = useState(false)
  const [tips, setTips] = useState('')
  const [switchStatus, setSwitchStatus] = useState({
    del: false,
    exit: false,
  })

  const [clearConfirm, setClearConfirm] = useState(0)
  const {
    useOnline,
    confirmExitEdit,
    confirmRemove,
    toggleUseOnline,
    toggleConfirmExitEdit,
    toggleConfirmRemove,
  } = useAppSettingsStore()

  const { currentUser, updateCurrentUser } = useUserStore()
  const { items } = useKeepingStore()

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

  return (
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
          title="再次确认"
          description="执行操作时再次询问"
          descriptionStyle={{ fontSize: 12 }}
          style={{ backgroundColor: '#f2f2f2' }}
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
            <Switch value={useOnline} onValueChange={toggleUseOnline} />
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
  )
}

export default Settings
