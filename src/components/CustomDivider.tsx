import { View, Text, ViewStyle, StyleSheet } from 'react-native'
import { Divider } from 'react-native-paper'

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
      <Text style={dividerStyle.text}>{text}</Text>
      <RightDivider />
    </View>
  )
}

const dividerStyle = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  text: {
    fontSize: 10,
    color: '#6d57a7',
    paddingHorizontal: 5,
  },
})

export default CustomDivider
