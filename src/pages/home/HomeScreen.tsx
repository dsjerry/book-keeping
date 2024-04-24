import { StatusBar, View, StyleSheet } from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { useNavigation } from '@react-navigation/native'

import { AddingButton, KeepingList } from './components'
import { useKeepingStore } from 'hooks/useStore'

const HomeScreen = () => {
  // const isDarkMode = useColorScheme() === 'dark'
  const isDarkMode = false

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  }

  const navigation = useNavigation()
  const { items } = useKeepingStore()
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
        <KeepingList item={items} />
        <View style={style.btnArea}>
          {/* 不知道为啥它接收 never */}
          <AddingButton
            onPress={() => {
              console.log(items)
              navigation.navigate('Adding' as never)
            }}
          />
        </View>
      </View>
    </>
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

export default HomeScreen
