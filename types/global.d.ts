interface MenuItem {
  id: string
  name: string
  icon: string
  alias?: string
}

interface AppSettings {
  useOnline: boolean
}

interface AnyObj {
  [key: string]: any
}
