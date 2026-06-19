import { useState } from 'react'
import { Text, View } from 'react-native'
import { HelperText, TextInput, Button, Snackbar, useTheme } from 'react-native-paper'
import { CheckBox } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native'

import { useUserContext } from './contexts/UserContext'
import { checkUsername, checkPassword, logging } from '~utils'
import { loginStyle } from './styles'
import { useUserStore } from '~store/userStore'
import { useAppSettingsStore } from '~store/settingStore'
import { useKeepingStore, userUsersKeepingStore } from '~store/keepingStore'
import { SigninParams, AuthService } from '~api/auth'

const InputPane: React.FC<InputPane> = ({
  value,
  label,
  tips,
  pw,
  showpw,
  onChangeText,
}) => {
  return (
    <View style={loginStyle.inputPane}>
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
  const theme = useTheme()
  const [tips, setTips] = useState('')
  const [badNameTips, setBadNameTips] = useState('')
  const [badPassTips, setBadPassTips] = useState('')
  const [badPassTwoTips, setBadPassTwoTips] = useState('')

  const { useOnline, toggleUseOnline } = useAppSettingsStore()
  const { add, setCurrentUser, getUserByName } = useUserStore()
  const { addItems } = useKeepingStore()
  const { get } = userUsersKeepingStore()

  const checkForm = () => {
    const username = checkUsername(state.username)
    const password = checkPassword(state.password)
    if (!username) {
      return setBadNameTips('用户名不符合要求！')
    }
    if (!password) {
      return setBadPassTips('密码不符合要求!')
    }
    if (state.isRegister) {
      if (password !== state.passwordTwo) {
        return setBadPassTwoTips('两次密码不一致！')
      }
    }

    return { username, password }
  }

  const clearTips = (timer = 1500) => {
    setTimeout(() => {
      setBadNameTips('')
      setBadPassTips('')
      setBadPassTwoTips('')
    }, timer)
  }

  const onError = (error: any) => logging.error('[登录注册]', error?.message)

  const onLogin = async () => {
    try {
      const result = checkForm()
      if (!result) return clearTips()

      const user = getUserByName(result?.username!)
      if (user && user.password === state.password) {
        navigation.navigate('UserHomeScreen', {
          user: { username: result?.username },
        })
        setCurrentUser(user)
        const userKeeping = get(user.id)
        if (userKeeping) {
          addItems(userKeeping.keeping)
        }
        if (useOnline) {
          const { success } = await AuthService.signin({ username: result.username, password: result.password })
          if (success) {
            setTips('登录成功')
          }
        }
      } else {
        setBadNameTips('用户名或密码不正确！')
      }
    } catch (error) {
      onError(error)
    }
  }

  const onRegister = async () => {
    const result = checkForm()
    if (!result) return clearTips()
    // 如果开启接口同步，那么注册成功后，需要将用户信息保存到远程数据库
    if (useOnline) {
      const res = await connectRemote(result)
      if (res === false) logging.info('[同步]连接线上失败')
    }

    add({ ...result, id: Date.now() + '' })
    navigation.navigate('UserHomeScreen', {
      user: { username: result.username },
    })
  }

  // 启用同步 勾选得时候，将数据保存到远程数据库
  const connectRemote = async (params: SigninParams) => {
    try {
      const { data, code, success } = await AuthService.signin(params)
      if (!success) return false

      const user = getUserByName(data.user.username!)
      if (user && user.password === state.password) {
        navigation.navigate('UserHomeScreen', {
          user: { username: data.user.username },
        })
        setCurrentUser(user)
        const userKeeping = get(user.id)
        if (userKeeping) {
          addItems(userKeeping.keeping)
        }
      } else {
        setBadNameTips('用户名或密码不正确！')
      }
    } catch (error) {
      onError(error)
      return false
    }
  }

  return (
    <View style={loginStyle.container}>
      <Snackbar
        visible={tips !== ''}
        onDismiss={() => setTips('')}
        action={{
          label: '确定',
          onPress: () => {
            setTips('')
          },
        }}>
        {tips}
      </Snackbar>
      <View style={loginStyle.formPane}>
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
            onChangeText={text =>
              dispatch({ type: 'passwordTwo', payload: text })
            }
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
            {state.isRegister ? '注册' : '登录'}
          </Button>
        </View>
        <View style={loginStyle.formBtn}>
          <Button
            mode="text"
            style={{ marginLeft: 10 }}
            onPress={() => {
              dispatch({ type: 'isRegister', payload: !state.isRegister })
            }}>
            {state.isRegister ? '登录' : '注册'}
          </Button>
          {state.isRegister && (
            <CheckBox
              checked={useOnline}
              title="启用同步"
              size={16}
              textStyle={{ fontSize: 12 }}
              containerStyle={{
                backgroundColor: 'transparent',
              }}
              checkedColor={theme.colors.primary}
              onPress={toggleUseOnline}
            />
          )}
        </View>
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
