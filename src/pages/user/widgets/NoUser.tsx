import { View, Text } from 'react-native'
import { Button, useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

export default function NoUser() {
  const navigation = useNavigation()
  const theme = useTheme()
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 20 }}>没有用户 !</Text>
      <Button mode="elevated" onPress={() => navigation.navigate('LoginScreen', {})}>
        去登陆 / 注册
      </Button>
    </View>
  )
}
