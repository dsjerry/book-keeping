import { View, Text } from 'react-native'
import { Button } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

export default function NoUser() {
  const navigation = useNavigation()
  return (
    <View
      style={{ height: '95%', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#6d57a7', fontWeight: 'bold', marginBottom: 20 }}>
        没有用户 !
      </Text>
      <Button
        mode="elevated"
        onPress={() => navigation.navigate('LoginScreen', {})}>
        去登陆 / 注册
      </Button>
    </View>
  )
}
