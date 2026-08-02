import { View, StyleSheet } from 'react-native'
import { Dialog, Portal, ActivityIndicator, useTheme } from 'react-native-paper'

interface Props {
  title?: string
  indicator?: boolean
  width?: number
  children?: React.ReactNode
  onBackdropPress: () => void
}

const CustomDialog: React.FC<Props> = ({ title, indicator, width, children, onBackdropPress }) => {
  const theme = useTheme()

  return (
    <Portal>
      <Dialog
        visible
        onDismiss={onBackdropPress}
        style={[style.dialog, width ? { width, alignSelf: 'center' } : { marginHorizontal: 40 }]}>
        {indicator !== false && (
          <Dialog.Content style={style.loadingContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </Dialog.Content>
        )}
        {children ? (
          <View>{children}</View>
        ) : (
          <Dialog.Title style={{ textAlign: 'center' }}>{title ? title : ''}</Dialog.Title>
        )}
      </Dialog>
    </Portal>
  )
}

const style = StyleSheet.create({
  dialog: {
    borderRadius: 12,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
})

export default CustomDialog
