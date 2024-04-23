import { useState } from 'react'
import { useSet } from 'ahooks'

export const useFormStore = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordTwo, setPasswordTwo] = useState('')
  const [isShowPassword, setIsShowPassword] = useState(false)
  // const [badGuys, { add: addBadGuy, remove: removeBadGuy }] = useSet<
  //   'username' | 'password' | 'passwordTwo'
  // >()

  const [badGuys, setBadGuys] = useState<{
    usename?: string
    password?: string
    passwordTwo?: string
  }>()

  const checkForm = (isReg = false) => {
    if (isReg) {
      if (passwordTwo.trim() !== password.trim()) {
        setBadGuys(prev => ({
          ...prev,
          passwordTwo: '两次密码不一致',
        }))
      } else {
        setBadGuys(prev => ({
          ...prev,
          passwordTwo: '',
        }))
      }
    }
    if (username.length < 6) {
      setBadGuys(prev => ({
        ...prev,
        username: '用户名至少6位',
      }))
    }
    if (password.length < 6) {
      setBadGuys(prev => ({
        ...prev,
        password: '密码至少6位',
      }))
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    passwordTwo,
    setPasswordTwo,
    badGuys,
    checkForm,
    isShowPassword,
    setIsShowPassword,
  }
}

export const useLogin = () => {}

export const useRegister = () => {}
