import { View, Text, StyleSheet } from 'react-native'
import { Icon, useTheme } from 'react-native-paper'

export function NothingHere() {
  const theme = useTheme()
  return (
    <View style={[style.container, { backgroundColor: theme.colors.background }]}>
      <Icon source="book-open-blank-variant" size={32} color={theme.colors.primary} />
      <Text style={[style.text, { color: theme.colors.primary }]}>这里什么都没有</Text>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
  },
})
