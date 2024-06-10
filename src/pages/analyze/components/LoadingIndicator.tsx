import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native'

import { _COLORS } from '~consts/Colors'

interface Props {
  animating: boolean
  text?: string
  indicatorBoxStyle?: ViewStyle
  children?: React.ReactNode
}

export const LoadingIndicator: React.FC<Props> = ({
  animating,
  text,
  indicatorBoxStyle,
  children,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={animating}
      statusBarTranslucent
      onRequestClose={() => {}}>
      <View style={styles.container}>
        <View style={[styles.indicatorBox, indicatorBoxStyle]}>
          <ActivityIndicator
            size={'large'}
            animating={animating}
            hidesWhenStopped
            color={_COLORS.main}
          />
          {children ? (
            children
          ) : (
            <Text style={{ color: _COLORS.main }}>
              {text ? text : '加载中...'}
            </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  indicatorBox: {
    width: '50%',
    height: '15%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  text: {
    color: _COLORS.main,
    fontWeight: 'bold',
  },
})
