import { Dispatch, createContext, useContext, useReducer } from 'react'

const initialState: State = {
  isShowModal: false,
  isShowMenu: false,
  activeKeeping: [],
  longPressMenu: [
    { id: '1', icon: 'information', name: '信息', alias: 'info' },
    { id: '2', icon: 'delete', name: '删除', alias: 'del' },
    { id: '3', icon: 'select-all', name: '全选', alias: 'sall' },
  ],
  editing: null,
}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'isShowModal':
      return {
        ...state,
        isShowModal: action.payload,
      }
    case 'isShowMenu':
      return {
        ...state,
        isShowMenu: action.payload,
      }
    case 'activeKeeping':
      return {
        ...state,
        activeKeeping: action.payload,
      }
    case 'toEditing':
      return {
        ...state,
        editing: action.payload,
      }
    default:
      return state
  }
}

const HomeContext = createContext<State>(initialState)

const HomeDispatchContext = createContext<Dispatch<Action> | null>(null)

export const HomeProvider: React.FC<Props> = ({ children }) => {
  // 这里初始化的时候，reducer 函数里面要实现对应的操作
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <HomeContext.Provider value={state}>
      <HomeDispatchContext.Provider value={dispatch}>
        {children}
      </HomeDispatchContext.Provider>
    </HomeContext.Provider>
  )
}

export const useHomeStore = () => {
  const context = useContext(HomeContext)
  if (!context) {
    throw new Error('useHomeStore 要在 HomeProvider 中使用')
  }
  return context
}

export const useHomeStoreDispatch = () => {
  const context = useContext(HomeDispatchContext)
  if (!context) {
    throw new Error('useHomeStoreDispatch 要在 HomeProvider 中使用')
  }
  return context
}

interface Props {
  children: React.ReactElement
}

interface State {
  isShowModal: boolean
  isShowMenu: boolean
  activeKeeping: KeepingItem['id'][]
  longPressMenu: MenuItem[]
  editing: KeepingItem | null
}

type Action =
  | { type: 'isShowMenu'; payload: boolean }
  | { type: 'isShowModal'; payload: boolean }
  | {
      type: 'activeKeeping'
      payload: KeepingItem['id'][]
    }
  | {
      type: 'toEditing'
      payload: KeepingItem
    }
