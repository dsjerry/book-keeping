interface User {
  username: string
  password: string
  avatar?: string
  note?: string
}

interface UserStoreAction {
  add: (user: User) => void
  update: (user: User) => void
  remove: (id: string) => void
}
