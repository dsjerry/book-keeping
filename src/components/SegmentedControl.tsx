import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { useTheme } from 'react-native-paper'

interface SegmentedControlProps {
  options: string[]
  activeIndex: number
  onChange: (index: number) => void
  style?: StyleProp<ViewStyle>
}

/**
 * 胶囊滑动分段控件：选中项为 primary 色胶囊，切换时胶囊沿 x 轴滑动（220ms）。
 * 动画由组件内部管理，外部只需提供选项、当前选中索引与切换回调。
 * 支持任意数量的选项。
 */
const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, activeIndex, onChange, style }) => {
  const theme = useTheme()
  const selectAnim = useRef(new Animated.Value(activeIndex)).current
  const [segWidth, setSegWidth] = useState(0)

  // activeIndex 变化时胶囊滑动到目标位置
  useEffect(() => {
    Animated.timing(selectAnim, {
      toValue: activeIndex,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [activeIndex, selectAnim])

  return (
    <View
      style={[
        styles.container,
        { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surfaceVariant },
        style,
      ]}
      onLayout={e => {
        const w = e.nativeEvent.layout.width
        if (w > 0 && w !== segWidth) setSegWidth(w)
      }}>
      {segWidth > 0 && (
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: theme.colors.primary,
              width: (segWidth - 8) / options.length,
              transform: [
                {
                  translateX: selectAnim.interpolate({
                    inputRange: [0, options.length - 1],
                    outputRange: [0, ((segWidth - 8) * (options.length - 1)) / options.length],
                  }),
                },
              ],
            },
          ]}
        />
      )}
      {options.map((label, i) => (
        <Pressable key={label} style={styles.btn} onPress={() => onChange(i)}>
          <Text
            style={[
              styles.text,
              { color: i === activeIndex ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
            ]}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 9,
  },
  btn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
})

export default SegmentedControl
