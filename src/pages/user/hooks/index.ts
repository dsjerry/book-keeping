import { logging } from '~utils'

export const useLoginFetch = async (form: LoginForm) => {
  try {
    return form
  } catch (error) {}
}

export const useRegisterFetch = async (form: LoginForm & RegisterForm) => {
  try {
    return form
  } catch (error) {
    logging.error(error)
  }
}

interface LoginForm {
  username: User['username']
  password: User['password']
}

interface RegisterForm extends LoginForm {
  passwordTwo: User['password']
}
