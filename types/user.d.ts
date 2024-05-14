interface User {
  id: string
  username: string
  password: string
  avatar?: string
  note?: string
  useOnline?: boolean
}

interface UserStoreAction {
  add: (user: User) => void
  update: (user: User) => void
  remove: (id: string) => void
}

interface UserStore {
  users: User[]
  currentUser: User | null
  add: (user: Partial<User, 'username' | 'password'>) => void
  update: (user: User) => void
  remove: (id: string) => void
  logout: () => void
  setCurrentUser: (user: User | null) => void
}
