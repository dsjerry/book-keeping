import { View, StyleSheet } from 'react-native'
import { Button, Dialog, Portal, Text } from 'react-native-paper'

const MyComponent: React.FC<Props> = ({
  title,
  content,
  onAccess,
  onCancel,
  visible,
}) => {
  const onDismiss = () => {
    console.log('OnDismiss')
  }

  return (
    <View style={[styles.container, { opacity: visible ? 1 : 0 }]}>
      <Portal>
        <Dialog visible={visible} onDismiss={onDismiss}>
          <Dialog.Title>{title ? title : 'Alert'}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {content ? content : 'This is simple dialog'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            {onCancel && <Button onPress={onCancel}>Cancel</Button>}
            <Button onPress={onAccess}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

interface Props {
  visible: boolean
  title?: string
  content?: string
  accessText?: string
  cancelText?: string
  onAccess?: () => void
  onCancel?: () => void
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
  },
})

export default MyComponent
