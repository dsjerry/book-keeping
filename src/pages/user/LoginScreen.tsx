import { useState, useRef } from 'react'
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { HelperText, TextInput, Button, Snackbar, useTheme, Checkbox, Avatar } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useUserContext } from './contexts/UserContext'
import { checkUsername, checkPassword, logging } from '~utils'
import { loginStyle } from './styles'
import SegmentedControl from '~components/SegmentedControl'
import { useUserStore } from '~store/userStore'
import { useAppSettingsStore } from '~store/settingStore'
import { useKeepingStore, userUsersKeepingStore } from '~store/keepingStore'
import { SigninParams, AuthService } from '~api/auth'

interface InputPaneProps {
  label: string
  value: string
  tips?: string
  pw?: boolean
  showpw?: boolean
  icon: string
  onChangeText: (text: string) => void
  onToggleShowPw?: () => void
}

const InputPane: React.FC<InputPaneProps> = ({
  value,
  label,
  tips,
  pw,
  showpw,
  icon,
  onChangeText,
  onToggleShowPw,
}) => {
  return (
    <View style={loginStyle.inputPane}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        secureTextEntry={pw && !showpw}
        onChangeText={text => onChangeText(text)}
        style={{ borderRadius: 12 }}
        left={<TextInput.Icon icon={icon} />}
        right={pw ? <TextInput.Icon icon={showpw ? 'eye' : 'eye-off'} onPress={onToggleShowPw} /> : null}
      />
      <HelperText type="error" visible={!!tips} style={loginStyle.helperText}>
        {tips}
      </HelperText>
    </View>
  )
}

const LoginPane = () => {
  const navigation = useNavigation()
  const { state, dispatch } = useUserContext()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [tips, setTips] = useState('')
  const [badNameTips, setBadNameTips] = useState('')
  const [badPassTips, setBadPassTips] = useState('')
  const [badPassTwoTips, setBadPassTwoTips] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      setSubmitting(true)
      const result = checkForm()
      if (!result) {
        setSubmitting(false)
        return clearTips()
      }

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
      setSubmitting(false)
    } catch (error) {
      onError(error)
      setSubmitting(false)
    }
  }

  const onRegister = async () => {
    setSubmitting(true)
    const result = checkForm()
    if (!result) {
      setSubmitting(false)
      return clearTips()
    }
    // 如果开启接口同步，那么注册成功后，需要将用户信息保存到远程数据库
    if (useOnline) {
      const res = await connectRemote(result)
      if (res === false) logging.info('[同步]连接线上失败')
    }

    add({ ...result, id: Date.now() + '' })
    navigation.navigate('UserHomeScreen', {
      user: { username: result.username },
    })
    setSubmitting(false)
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

  const onModeSwitch = (index: number) => {
    const targetRegister = index === 1
    if (targetRegister === state.isRegister) return
    dispatch({ type: 'isRegister', payload: targetRegister })
    clearTips()
  }

  const activeIndex = state.isRegister ? 1 : 0

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 24, paddingHorizontal: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Branding hero */}
          <View style={loginStyle.heroSection}>
            <Avatar.Icon
              icon="wallet"
              size={64}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.onPrimaryContainer}
            />
            <Text style={[loginStyle.appTitle, { color: theme.colors.primary }]}>记账本</Text>
            <Text style={[loginStyle.tagline, { color: theme.colors.onSurfaceVariant }]}>记录每一笔，掌握每一刻</Text>
          </View>

          {/* Segmented 登录/注册 switcher */}
          <SegmentedControl
            options={['登录', '注册']}
            activeIndex={activeIndex}
            onChange={onModeSwitch}
            style={{ marginBottom: 24 }}
          />

          {/* Form */}
          <View style={loginStyle.formPane}>
            <InputPane
              label="用户名"
              value={state.username}
              tips={badNameTips}
              icon="account-outline"
              onChangeText={text => dispatch({ type: 'username', payload: text })}
            />
            <InputPane
              label="密码"
              value={state.password}
              tips={badPassTips}
              pw
              showpw={state.isShowPassword}
              icon="lock-outline"
              onChangeText={text => dispatch({ type: 'password', payload: text })}
              onToggleShowPw={() => dispatch({ type: 'isShowPassword', payload: !state.isShowPassword })}
            />
            {state.isRegister && (
              <InputPane
                label="确认密码"
                value={state.passwordTwo}
                tips={badPassTwoTips}
                pw
                showpw={state.isShowPassword}
                icon="lock-check-outline"
                onChangeText={text => dispatch({ type: 'passwordTwo', payload: text })}
                onToggleShowPw={() => dispatch({ type: 'isShowPassword', payload: !state.isShowPassword })}
              />
            )}
            <View style={loginStyle.submitPane}>
              <Button
                mode="contained"
                style={loginStyle.submitBtn}
                labelStyle={loginStyle.submitLabel}
                loading={submitting}
                onPress={() => {
                  if (state.isRegister) return onRegister()
                  onLogin()
                }}>
                {state.isRegister ? '注册' : '登录'}
              </Button>
            </View>
            {state.isRegister && (
              <View style={loginStyle.checkboxRow}>
                <Checkbox
                  status={useOnline ? 'checked' : 'unchecked'}
                  onPress={toggleUseOnline}
                  color={theme.colors.primary}
                  uncheckedColor={theme.colors.onSurfaceVariant}
                />
                <Text style={[loginStyle.checkboxLabel, { color: theme.colors.onSurfaceVariant }]}>启用同步</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    </View>
  )
}

export default LoginPane
