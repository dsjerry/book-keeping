import { View, Text, Modal, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'
import { useTheme } from 'react-native-paper'

interface Props {
  animating: boolean
  text?: string
  indicatorBoxStyle?: ViewStyle
  children?: React.ReactNode
}

const LoadingIndicator: React.FC<Props> = ({ animating, text, indicatorBoxStyle, children }) => {
  const theme = useTheme()

  return (
    <Modal animationType="fade" transparent visible={animating} statusBarTranslucent onRequestClose={() => {}}>
      <View style={[styles.container, { backgroundColor: theme.colors.backdrop }]}>
        <View style={[styles.indicatorBox, { backgroundColor: theme.colors.surface }, indicatorBoxStyle]}>
          <ActivityIndicator size={'large'} animating={animating} hidesWhenStopped color={theme.colors.primary} />
          {children ? (
            children
          ) : (
            <Text style={[styles.text, { color: theme.colors.primary }]}>{text ? text : '加载中...'}</Text>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorBox: {
    width: 180,
    minHeight: 120,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  text: {
    fontWeight: 'bold',
    marginTop: 12,
  },
})

export default LoadingIndicator
