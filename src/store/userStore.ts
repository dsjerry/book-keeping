import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface UserInfoSlice {
  users: User[]
  currentUser: User | null
  add: (user: User) => void
  update: (user: User) => void
  remove: (id: string) => void
  logout: () => void
  setCurrentUser: (user: User) => void
}

interface UserSettingsSlice {
  useOnline?: boolean
  tags: OutType[]
  setTags: (tags: OutType[]) => void
  removeTag: (tag: OutType) => void
}

export interface UserStore extends UserSettingsSlice, UserInfoSlice {}

const createUserSettingsSlice: StateCreator<
  UserStore,
  [],
  [],
  UserSettingsSlice
> = (set, get) => ({
  useOnline: true,
  tags: [],
  setTags: tags => {
    console.info('添加:', tags)
    const currentTags = get().currentUser?.tags || []
    const _tags = new Set([...currentTags, ...tags])
    set({ currentUser: { ...get().currentUser!, tags: [..._tags] } })
  },
  removeTag: tag => {
    console.info('删除标签:', tag)
    const currentTags = get().currentUser?.tags || []
    const _tags = new Set([...currentTags].filter(t => t !== tag))
    set({ currentUser: { ...get().currentUser!, tags: [..._tags] } })
  },
})

const createUserInfoSlice: StateCreator<UserStore, [], [], UserInfoSlice> = (
  set,
  get,
) => {
  return {
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
  }
}

export const useUserStore = create<UserStore>()(
  persist(
    (...a) => ({
      ...createUserSettingsSlice(...a),
      ...createUserInfoSlice(...a),
    }),
    {
      name: `user`,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        users: state.users,
        currentUser: state.currentUser,
      }),
    },
  ),
)
