import { useState } from 'react'
import { Text, View } from 'react-native'
import { HelperText, TextInput, Button } from 'react-native-paper'
import { CheckBox } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native'

import { useUserContext } from './contexts/UserContext'
import { checkUsername, checkPassword } from '~utils'
import { logging } from '~utils'
import { loginStyle } from './styles'
import { useAppSettingsStore } from '~store/settingStore'

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
  const navigation = useNavigation()
  const { state, dispatch } = useUserContext()
  const [badNameTips, setBadNameTips] = useState('')
  const [badPassTips, setBadPassTips] = useState('')
  const [badPassTwoTips, setBadPassTwoTips] = useState('')

  const { useOnline, toggleUseOnline } = useAppSettingsStore()

  const onLogin = () => {
    // TEST
    return navigation.navigate('UserHome' as never)

    const username = checkUsername(state.username)
    const password = checkPassword(state.password)
    if (!username || !password) {
      !username && setBadNameTips('Username is invalid!')
      !password && setBadPassTips('Password is invalid!')
      setTimeout(() => {
        setBadNameTips('')
        setBadPassTips('')
      }, 1500)
      return logging.error('invalid username or password:', username, password)
    }
  }

  const onRegister = () => {}

  return (
    <View style={loginStyle.container}>
      <InputPane
        label="用户名"
        value={state.username}
        tips={badNameTips}
        onChangeText={text => dispatch({ type: 'username', payload: text })}
      />
      <InputPane
        label="密码"
        value={state.password}
        tips={badPassTips}
        pw
        showpw={state.isShowPassword}
        onChangeText={text => dispatch({ type: 'password', payload: text })}
      />
      {state.isRegister && (
        <InputPane
          label="确认密码"
          value={state.passwordTwo}
          tips={badPassTwoTips}
          pw
          showpw={state.isShowPassword}
          onChangeText={text => dispatch({ type: 'password', payload: text })}
        />
      )}
      <View style={loginStyle.submitPane}>
        <Button
          mode="outlined"
          style={loginStyle.submitBtn}
          onPress={() => {
            if (state.isRegister) return onRegister()
            onLogin()
          }}>
          {state.isRegister ? 'register' : 'login'}
        </Button>
      </View>
      <View style={loginStyle.formBtn}>
        <Button
          mode="text"
          style={{ marginLeft: 10 }}
          onPress={() => {
            dispatch({ type: 'isRegister', payload: !state.isRegister })
          }}>
          {state.isRegister ? 'login' : 'register'}
        </Button>
        <CheckBox
          checked={useOnline}
          title="启用同步"
          size={16}
          textStyle={{ fontSize: 12 }}
          containerStyle={{
            backgroundColor: 'transparent',
          }}
          checkedColor="#6b4faa"
          onPress={toggleUseOnline}
        />
      </View>
    </View>
  )
}

interface InputPane {
  label: string
  value: string
  tips?: string
  pw?: boolean
  showpw?: boolean
  onChangeText: (text: string) => void
}

export default LoginPane
