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

interface AnyObj {
  [key: string]: any
}
