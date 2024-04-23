import React from 'react'
import { StatusBar, View, StyleSheet } from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { createStackNavigator } from '@react-navigation/stack'
import { useNavigation } from '@react-navigation/native'

import Adding from '../adding'
import AddingButton from 'components/AddingButton'
import KeepingList from 'components/KeepingList'

const RootStack = createStackNavigator()

const HomeScreen = () => {
  // const isDarkMode = useColorScheme() === 'dark'
  const isDarkMode = false

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  }

  const navigation = useNavigation()
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
          ...style.container,
        }}>
        <KeepingList />
        <View style={style.btnArea}>
          {/* 不知道为啥它接收 never */}
          <AddingButton
            onPress={() => navigation.navigate('Adding' as never)}
          />
        </View>
      </View>
    </>
  )
}

export default function Home() {
  return (
    <RootStack.Navigator>
      <RootStack.Group screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Home" component={HomeScreen} />
      </RootStack.Group>
      <RootStack.Group
        screenOptions={{
          headerShown: false,
          presentation: 'modal',
          cardStyle: {
            marginTop: 40,
            borderRadius: 10,
          },
        }}>
        <RootStack.Screen name="Adding" component={Adding} />
      </RootStack.Group>
    </RootStack.Navigator>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  btnArea: {
    position: 'absolute',
    bottom: 20,
  },
})
