import { logging } from '~utils'
import { useFetch } from '~hooks/useFetch'

export const useLoginFetch = async (form: LoginForm) => {
  try {
  } catch (error) {}
}

export const useRegisterFetch = async (form: RegisterForm) => {
  try {
  } catch (error) {}
}

interface LoginForm {
  username: User['username']
  password: User['password']
}

interface RegisterForm extends LoginForm {
  passwordTwo: User['password']
}
