import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Avatar } from 'react-native-paper'
import { useUserContext } from './contexts/UserContext'
import NoUser from './widgets/NoUser'

const UserHome = () => {
  const [haveUser, setHaveUser] = useState(false)
  const { state } = useUserContext()
  return (
    <View style={style.container}>
      {!haveUser ? (
        <NoUser />
      ) : (
        <>
          <Avatar.Text label={state.username}></Avatar.Text>
          <Text>{state.username ? state.username : 'testuser'}</Text>
        </>
      )}
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
})

export default UserHome
