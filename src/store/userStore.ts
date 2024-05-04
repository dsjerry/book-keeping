import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => {
      return {
        users: [],
        add: user => {
          set(state => {
            user.note = user.note || '这个人很懒，什么也没留下'
            return { users: [...state.users, user] }
          })
        },
        remove: id => {
          set(() => {
            return { users: get().users.filter(user => user.id !== id) }
          })
        },
        update: user => {
          set(state => {
            return {
              users: state.users.map(u => (u.id === user.id ? user : u)),
            }
          })
        },
      }
    },
    { name: 'user' },
  ),
)

export { useUserStore }
