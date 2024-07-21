import { View, Text } from 'react-native'
import { Icon } from 'react-native-paper'

export function NothingHere() {
  return (
    <View
      style={{ height: '90%', justifyContent: 'center', alignItems: 'center' }}>
      <Icon source="book-open-blank-variant" size={24} color="#6d57a7" />
      <Text style={{ color: '#6d57a7', marginTop: 10 }}>这里什么都没有</Text>
    </View>
  )
}
