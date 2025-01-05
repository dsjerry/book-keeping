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
}

interface OutType {
  id: string
  name: string
  icon: string
  isChecked: boolean
  alias: string
  isCustom?: boolean
}
