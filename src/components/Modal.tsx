import { Button, Dialog, Portal, Text } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'

const MyComponent: React.FC<Props> = ({ title, content, onAccess, onCancel, visible, loading }) => {
  const onDismiss = () => {
    onCancel?.()
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title ? title : '提示'}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          {typeof content === 'string' ? (
            <Text variant="bodyMedium">{content}</Text>
          ) : (
            <View style={styles.contentWrapper}>
              {content}
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          {onCancel && <Button onPress={onCancel} disabled={loading}>取消</Button>}
          <Button onPress={onAccess} loading={loading} disabled={loading}>确认</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
    minWidth: 300,
  },
  content: {
    paddingHorizontal: 24,
  },
  contentWrapper: {
    // 移除 flex: 1，让内容自然扩展
  },
})

interface Props {
  visible: boolean
  title?: string
  content?: string | React.JSX.Element
  accessText?: string
  cancelText?: string
  loading?: boolean
  onAccess?: () => void
  onCancel?: () => void
}

export default MyComponent
