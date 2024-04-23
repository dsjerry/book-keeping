import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Avatar } from 'react-native-paper'
import { useFormStore } from './hooks/useUser'

const UserHome = () => {
  const { username } = useFormStore()
  return (
    <View style={style.container}>
      <Avatar.Text label={username}></Avatar.Text>
      <Text>{username ? username : 'testuser'}</Text>
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
