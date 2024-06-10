import { createContext, useContext, useReducer, Dispatch } from 'react'

const initialState: State = {
  isShowRightMenu: false,
  isShowBottomModal: false,
  halfModalType: 'sort',
  loading: false,
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'isShowRightMenu':
      return {
        ...state,
        isShowRightMenu: action.payload,
      }
    case 'isShowBottomModal':
      return {
        ...state,
        isShowBottomModal: action.payload,
      }
    case 'halfModalType':
      return {
        ...state,
        halfModalType: action.payload,
        isShowBottomModal: true,
        isShowRightMenu: false,
      }
    case 'loading':
      return {
        ...state,
        loading: action.payload,
      }
    default:
      return state
  }
}

const HeaderContext = createContext<Context | null>(null)

export const HeaderProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <HeaderContext.Provider value={{ state, dispatch }}>
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeaderContext = () => {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error('HeaderContext 不存在')
  }
  return context
}

interface Props {
  children: React.ReactElement
}

interface State {
  isShowRightMenu: boolean
  isShowBottomModal: boolean
  loading: boolean
  halfModalType: 'sort' | 'filter'
}

type Action =
  | {
      type: 'isShowRightMenu'
      payload: boolean
    }
  | {
      type: 'isShowBottomModal'
      payload: boolean
    }
  | {
      type: 'halfModalType'
      payload: 'sort' | 'filter'
    }
  | {
      type: 'loading'
      payload: boolean
    }

type Context = {
  state: State
  dispatch: Dispatch<Action>
}
