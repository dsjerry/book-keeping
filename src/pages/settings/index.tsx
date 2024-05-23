import { createStackNavigator } from '@react-navigation/stack'

import HomeScreen from './HomeScreen'
import AboutScreen from './AboutScreen'

const Stack = createStackNavigator()

const Settings = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="SettingsHomeScreen">
      <Stack.Screen name="SettingsHomeScreen" component={HomeScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
    </Stack.Navigator>
  )
}

export default Settings
