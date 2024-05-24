import { createContext, useContext, useReducer, Dispatch } from 'react'

import { useUserStore, UserStore } from '~store/userStore'
import {
  useKeepingStore,
  CommonSlice as KeepingContext,
} from '~store/keepingStore'

const initialState: State = {
  id: '',
  username: '',
  password: '',
  passwordTwo: '',
  isShowPassword: false,
  isRegister: false,
  isShowLoading: false,
  badUsername: false,
  badPassword: false,
  badPasswordTwo: false,
}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'isRegister':
      return {
        ...state,
        isRegister: action.payload,
      }
    case 'username':
      return {
        ...state,
        username: action.payload,
      }
    case 'password':
      return {
        ...state,
        password: action.payload,
      }
    case 'passwordTwo':
      return {
        ...state,
        passwordTwo: action.payload,
      }
    case 'isShowPassword':
      return {
        ...state,
        isShowPassword: action.payload,
      }
    case 'setBad':
      return {
        ...state,
        [action.payload.target]: action.payload.value,
      }
  }
}

const UserContext = createContext<Context | null>(null)

export const UserProvider: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const userStore = useUserStore()
  const keepingStore = useKeepingStore()

  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <UserContext.Provider value={{ state, userStore, keepingStore, dispatch }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext 要在 UserProvider 中使用')
  }
  return context
}

type Context = {
  state: State
  userStore: UserStore
  keepingStore: KeepingContext
  dispatch: Dispatch<Action>
}

interface State extends User {
  isShowLoading: boolean
  isRegister: boolean
  isShowPassword: boolean
  passwordTwo: string
  badUsername: boolean
  badPassword: boolean
  badPasswordTwo: boolean
}

type Action =
  | { type: 'isRegister'; payload: boolean }
  | { type: 'username'; payload: string }
  | { type: 'password'; payload: string }
  | { type: 'passwordTwo'; payload: string }
  | { type: 'isShowPassword'; payload: boolean }
  | {
      type: 'setBad'
      payload: {
        target: 'username' | 'password' | 'passwordTwo'
        value: boolean
      }
    }
