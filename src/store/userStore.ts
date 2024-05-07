import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
    {
      name: 'user',
      partialize: state => ({ users: state.users }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export { useUserStore }
