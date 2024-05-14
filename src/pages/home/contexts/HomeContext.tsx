import { Dispatch, createContext, useContext, useReducer } from 'react'

const initialState: State = {
  isShowModal: false,
  modalTitle: '',
  modalBody: '',
  isShowMenu: false,
  activeKeeping: [],
  longPressMenu: [
    { id: '1', icon: 'information', name: '信息', alias: 'info' },
    { id: '2', icon: 'delete', name: '删除', alias: 'del' },
    { id: '3', icon: 'select-all', name: '全选', alias: 'sall' },
  ],
  editing: null,
  form: {
    id: '',
    count: '',
    type: 'out',
    countType: '人民币',
    tags: [],
    isChecked: false,
    note: '',
    image: '',
    no: 0,
    date: 0,
  },
  countTypeIndex: 0,
}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'isShowModal':
      return {
        ...state,
        isShowModal: action.payload,
      }
    case 'setModal':
      return {
        ...state,
        modalTitle: action.payload.title,
        modalBody: action.payload.body,
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
    case 'fromEditing':
      return {
        ...state,
        form: {
          ...action.payload,
          tags: action.payload.tags,
        },
      }
    case 'addForm':
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload,
        },
      }
    case 'emptyForm':
      return {
        ...state,
        form: {
          ...initialState.form,
          tags: [],
        },
      }
    case 'countTypeIndex':
      return {
        ...state,
        countTypeIndex: action.payload,
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
  modalTitle: string
  modalBody: string
  isShowMenu: boolean
  activeKeeping: KeepingItem['id'][]
  longPressMenu: MenuItem[]
  editing: KeepingItem | null
  form: KeepingItem
  countTypeIndex: number
}

type Action =
  | { type: 'isShowMenu'; payload: boolean }
  | { type: 'isShowModal'; payload: boolean }
  | {
      type: 'activeKeeping'
      payload: KeepingItem['id'][]
    }
  | {
      type: 'fromEditing'
      payload: KeepingItem
    }
  | {
      type: 'addForm'
      payload: KeepingItem
    }
  | {
      type: 'editForm'
      payload: KeepingItem
    }
  | {
      type: 'emptyForm'
    }
  | {
      type: 'countTypeIndex'
      payload: number
    }
  | {
      type: 'setModal'
      payload: {
        title: string
        body: string
      }
    }
