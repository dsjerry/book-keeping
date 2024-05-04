import { useState } from 'react'
import { View } from 'react-native'
import { List, Switch } from 'react-native-paper'
import { useKeepingStore } from '~hooks/useStore'
const Settings = () => {
  const [switchStatus, setSwitchStatus] = useState({
    del: false,
    exit: false,
  })

  const [clearConfirm, setClearConfirm] = useState(0)

  const { empty } = useKeepingStore()

  const clearCache = () => {
    setClearConfirm(prev => prev + 1)
    if (clearConfirm === 2) {
      empty()
      setClearConfirm(0)
    }
  }

  return (
    <View>
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
                  setSwitchStatus({ ...switchStatus, del: value })
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
                  setSwitchStatus({ ...switchStatus, exit: value })
                }
              />
            )}
          />
        </List.Accordion>
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
          onPress={() => console.log('Pressed')}
        />
        <List.Item
          title="软件信息"
          left={props => <List.Icon {...props} icon="information-outline" />}
          onPress={() => console.log('Pressed')}
        />
      </List.Section>
    </View>
  )
}

export default Settings
