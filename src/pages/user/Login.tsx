import React from 'react'
import { useState } from 'react'
import { View } from 'react-native'
import { HelperText, TextInput, Button } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

import { useFormStore } from './hooks/useUser'

interface InputPane {
  label: string
  value: string
  tips?: string
  pw?: boolean
  showpw?: boolean
  onChangeText: (text: string) => void
}

const InputPane: React.FC<InputPane> = ({
  value,
  label,
  tips,
  pw,
  showpw,
  onChangeText,
}) => {
  return (
    <View>
      <TextInput
        label={label}
        value={value}
        secureTextEntry={pw}
        onChangeText={text => onChangeText(text)}
        right={pw ? <TextInput.Icon icon={showpw ? 'eye' : 'eye-off'} /> : null}
      />
      <HelperText type="error" visible={!!tips}>
        {tips}
      </HelperText>
    </View>
  )
}

const LoginPane = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  const navigation = useNavigation()
  const { isShowPassword, passwordTwo } = useFormStore()

  const onLogin = () => {
    // TEST
    // return navigation.navigate('UserHome' as never)
  }

  const onRegister = () => {}

  return (
    <View>
      <InputPane
        label="Username"
        value={username}
        tips="Username is invalid!"
        onChangeText={text => setUsername(text)}
      />
      <InputPane
        label="Password"
        value={password}
        tips="Password is invalid!"
        pw
        showpw={isShowPassword}
        onChangeText={text => setPassword(text)}
      />
      {isRegister && (
        <InputPane
          label="Password"
          value={passwordTwo}
          tips="Password is invalid!"
          pw
          showpw={isShowPassword}
          onChangeText={text => setPassword(text)}
        />
      )}
      <Button
        mode="outlined"
        onPress={() => {
          if (isRegister) return onRegister()
          onLogin()
        }}>
        {isRegister ? 'register' : 'login'}
      </Button>
      <Button
        mode="text"
        onPress={() => {
          setIsRegister(prev => !prev)
        }}>
        {isRegister ? 'login' : 'register'}
      </Button>
    </View>
  )
}

export default LoginPane
