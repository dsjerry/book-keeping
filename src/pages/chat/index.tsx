import { createStackNavigator } from '@react-navigation/stack'
import ChatScreen from './ChatScreen'

const ChatStack = createStackNavigator()

export default function Chat() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="Chat" component={ChatScreen} />
    </ChatStack.Navigator>
  )
}
