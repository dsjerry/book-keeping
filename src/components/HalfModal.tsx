import { Modal, StyleSheet, Text, View } from 'react-native'
import { Button, useTheme } from 'react-native-paper'

interface Props {
  isShow?: boolean
  title?: string | React.ReactElement
  children?: React.ReactElement
  onClosePress?: () => void
  closed?: () => void
}

const HalfModal: React.FC<Props> = ({ isShow, children, title, onClosePress }) => {
  const theme = useTheme()
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isShow}
      onRequestClose={() => {
        onClosePress?.()
      }}>
      <View style={[styles.centeredView, { backgroundColor: theme.colors.backdrop }]}>
        <View
          style={[
            modal.container,
            {
              backgroundColor: theme.colors.surface,
              maxHeight: '70%',
            },
          ]}>
          <View style={header.container}>
            <Text style={[header.title, { color: theme.colors.primary }]}>{title}</Text>
          </View>
          <View>{children}</View>
          <View style={[footer.container, { borderTopColor: theme.colors.primary }]}>
            <Button onPress={onClosePress} textColor={theme.colors.primary}>
              关闭
            </Button>
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
  },
})

const modal = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    height: 'auto',
    width: '100%',
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
  },
})

export default HalfModal
