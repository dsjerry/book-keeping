import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      add: user => {
        console.log(user)
        set(state => {
          user.note = user.note || '这个人很懒，什么也没留下'
          return { users: [...state.users, user], currentUser: user }
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
            currentUser: user,
          }
        })
      },
      logout: () => {
        set({ currentUser: null })
      },
      setCurrentUser: user => {
        const userInStore = get().users.find(u => u.id === user?.id)
        if (userInStore) {
          set({ currentUser: { ...userInStore, ...user } })
        }
      },
    }),
    {
      name: 'user',
      partialize: state => ({
        users: state.users,
        currentUser: state.currentUser,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
