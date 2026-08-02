import { Button, Dialog, Portal, Text } from 'react-native-paper'

const MyComponent: React.FC<Props> = ({ title, content, onAccess, onCancel, visible }) => {
  const onDismiss = () => {
    onCancel?.()
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title ? title : '提示'}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{content}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          {onCancel && <Button onPress={onCancel}>取消</Button>}
          <Button onPress={onAccess}>确认</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

interface Props {
  visible: boolean
  title?: string
  content?: string | React.JSX.Element
  accessText?: string
  cancelText?: string
  onAccess?: () => void
  onCancel?: () => void
}

export default MyComponent
