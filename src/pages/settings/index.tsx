import { createStackNavigator } from '@react-navigation/stack'

import HomeScreen from './HomeScreen'
import AboutScreen from './AboutScreen'
import PermissionScreen from './PermissionScreen'
import LicensesScreen from './LicensesScreen'

const Stack = createStackNavigator()

const Settings = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SettingsHomeScreen">
      <Stack.Screen name="SettingsHomeScreen" component={HomeScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      <Stack.Screen name="PermissionScreen" component={PermissionScreen} />
      <Stack.Screen name="LicensesScreen" component={LicensesScreen} />
    </Stack.Navigator>
  )
}

export default Settings
