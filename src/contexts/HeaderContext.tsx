import { createContext, useContext, useReducer, Dispatch } from 'react'
import type { TimeFilter } from '~utils/getData'

const initialState: State = {
  isShowRightMenu: false,
  isShowAnalyzeMenu: false,
  isShowBottomModal: false,
  halfModalType: 'sort',
  loading: false,
  timeFilter: 'all',
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'isShowRightMenu':
      return {
        ...state,
        isShowRightMenu: action.payload,
        isShowAnalyzeMenu: false,
      }
    case 'isShowAnalyzeMenu':
      return {
        ...state,
        isShowAnalyzeMenu: action.payload,
        isShowRightMenu: false,
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
        isShowAnalyzeMenu: false,
      }
    case 'loading':
      return {
        ...state,
        loading: action.payload,
      }
    case 'timeFilter':
      return {
        ...state,
        timeFilter: action.payload,
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
  isShowAnalyzeMenu: boolean
  isShowBottomModal: boolean
  loading: boolean
  halfModalType: 'sort' | 'filter'
  timeFilter: TimeFilter
}

type Action =
  | {
      type: 'isShowRightMenu'
      payload: boolean
    }
  | {
      type: 'isShowAnalyzeMenu'
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
  | {
      type: 'timeFilter'
      payload: TimeFilter
    }

type Context = {
  state: State
  dispatch: Dispatch<Action>
}
