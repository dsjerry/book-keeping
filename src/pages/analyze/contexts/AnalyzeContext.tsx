import { createContext, useContext, useReducer } from 'react'
import type { Dispatch } from 'react'

interface Props {
  children: React.ReactElement
}

interface State {}

type Action = {
  type: 'init'
  payload: {}
}

interface Context {
  state: State
  dispatch: Dispatch<Action>
}
const initialData: State = {}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    default:
      return state
  }
}

const AnalyzeContext = createContext<Context | null>(null)

export const AnalyzeProvider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialData)
  return (
    <AnalyzeContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalyzeContext.Provider>
  )
}

export const useAnalyzeStore = () => {
  const context = useContext(AnalyzeContext)
  if (!context) {
    throw new Error('AnalyzeProvider 这里有问题')
  }
  return context
}
