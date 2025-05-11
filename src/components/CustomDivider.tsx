import { View, Text, ViewStyle, StyleSheet } from 'react-native'
import { Divider, useTheme } from 'react-native-paper'

interface Props {
  text?: string
  textPosi?: 'left' | 'right' | 'center'
  style?: ViewStyle
}

const CustomDivider: React.FC<Props> = ({
  style,
  text = '',
  textPosi = 'center',
}) => {
  // 获取当前主题
  const theme = useTheme();
  const LeftDivider = () =>
    textPosi === 'right' || textPosi === 'center' ? (
      <Divider style={{ flex: 1 }} />
    ) : (
      <></>
    )
  const RightDivider = () =>
    textPosi === 'left' || textPosi === 'center' ? (
      <Divider style={{ flex: 1 }} />
    ) : (
      <></>
    )

  return (
    <View style={[dividerStyle.container, style]}>
      <LeftDivider />
      <Text style={[dividerStyle.text, { color: theme.colors.primary }]}>{text}</Text>
      <RightDivider />
    </View>
  )
}

const dividerStyle = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  text: {
    fontSize: 10,
    // 颜色将通过主题动态设置
    paddingHorizontal: 5,
  },
})

export default CustomDivider
