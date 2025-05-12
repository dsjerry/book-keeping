import { useState } from 'react'
import { Text, View } from 'react-native'
import { HelperText, TextInput, Button } from 'react-native-paper'
import { CheckBox } from '@rneui/themed'
import { useNavigation } from '@react-navigation/native'

import { useUserContext } from './contexts/UserContext'
import { checkUsername, checkPassword } from '~utils'
import { loginStyle } from './styles'
import { useUserStore } from '~store/userStore'
import { useAppSettingsStore } from '~store/settingStore'
import { useKeepingStore, userUsersKeepingStore } from '~store/keepingStore'
import { useRegisterFetch, useLoginFetch } from './hooks'
import { userApi, LoginParams } from 'src/api'

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

  const onError = (error: any) => console.log('[登录注册]', error?.message)

  const onLogin = async () => {
    try {
      const result = checkForm()
      if (!result) return clearTips()

      const res = await useLoginFetch(result)
      const user = getUserByName(res?.username!)
      if (user && user.password === state.password) {
        navigation.navigate('UserHomeScreen', {
          user: { username: res?.username },
        })
        setCurrentUser(user)
        const userKeeping = get(user.id)
        if (userKeeping) {
          addItems(userKeeping.keeping)
        }
      } else {
        setBadNameTips('用户名或密码不正确！')
      }
    } catch (error) { }
  }

  const onRegister = async () => {
    const result = checkForm()
    if (!result) return clearTips()
    const res = (await useRegisterFetch({
      ...result,
      passwordTwo: state.passwordTwo,
    })) as any

    add(res)
    navigation.navigate('UserHomeScreen', {
      user: { username: res?.username },
    })
  }

  // 启用同步 勾选得时候，将数据保存到远程数据库
  const connectRemote = async (params: LoginParams) => {
    try {
      const { data, code } = await userApi.login(params)
      if (code !== 200) throw new Error('出错了')

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
    }
  }

  return (
    <View style={loginStyle.container}>
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
              checkedColor="#6b4faa"
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
