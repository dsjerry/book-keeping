interface AnyObj {
  [key: string]: any
}

interface MenuItem {
  id: string
  name: string
  icon: string
  alias?: string
}

interface AppSettings {
  useOnline: boolean
  confirmExitEdit: boolean
  confirmRemove: boolean
  useBiometrics: boolean
  themeMode: 'system' | 'light' | 'dark'
  monthlyBudget: number
  deepseekApiKey: string
  deepseekModel: string
}

interface User {
  id: string
  username: string
  password: string
  avatar?: string
  note?: string
  useOnline?: boolean
  email?: string
  tags?: OutType[]
  serverId?: number // 启用线上之后的ID
}

interface OutType {
  id: string
  name: string
  icon: string
  isChecked: boolean
  alias: string
  isCustom?: boolean
  color?: string // 图标主题色名，如 'primary'/'tertiary'
}
