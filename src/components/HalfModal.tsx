import { Modal, StyleSheet, Text, View } from 'react-native'
import { Button, useTheme } from 'react-native-paper'

interface Props {
  isShow?: boolean
  title?: string | React.ReactElement
  children?: React.ReactElement
  onClosePress?: () => void
  closed?: () => void
}

const HalfModal: React.FC<Props> = ({
  isShow,
  children,
  title,
  onClosePress,
}) => {
  const theme = useTheme() // 获取当前主题
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isShow}
      onRequestClose={() => {
        // 点击返回或者滑动返回的时候触发
        onClosePress?.()
      }}>
      <View style={styles.centeredView}>
        <View style={[modal.container, { backgroundColor: theme.colors.surface }]}>
          <View style={header.container}>
            <Text style={[header.title, { color: theme.colors.primary }]}>{title}</Text>
          </View>
          <View>{children}</View>
          <View style={[footer.container, { borderTopColor: theme.colors.primary }]}>
            <Button onPress={onClosePress} textColor={theme.colors.primary}>关闭</Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
})

const modal = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    // height: '30%',
    height: 'auto',
    width: '100%',
    // 背景色将通过主题动态设置
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
})

const header = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  title: {
    fontWeight: 'bold',
    // 文本颜色将通过主题动态设置
  },
})

const footer = StyleSheet.create({
  container: {
    marginTop: 'auto',
    paddingVertical: 5,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.5,
    // 边框颜色将通过主题动态设置
  },
})

export default HalfModal
