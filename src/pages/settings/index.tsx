import { useState } from 'react'
import { View } from 'react-native'
import { List, Switch } from 'react-native-paper'

const Settings = () => {
  const [switchStatus, setSwitchStatus] = useState({
    del: false,
    exit: false,
  })

  return (
    <View>
      <List.Section title="基本设置">
        <List.Accordion
          title="再次确认"
          description="执行操作时再次询问"
          descriptionStyle={{ fontSize: 12 }}>
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
