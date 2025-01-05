import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OutTypes } from '~consts/Data'

interface UserInfoSlice {
  users: User[]
  currentUser: User | null
  add: (user: User) => void
  update: (user: User) => void
  remove: (id: string) => void
  getUserByName: (name: string) => User | void
  setCurrentUser: (user: User | null) => void
  updateCurrentUser: (user: Partial<User>) => void
  EMPTYUSERS: () => void
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
    console.info('添加标签:', tags)
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
      set(state => {
        // 初始化用户数据
        user.id = Date.now().toString()
        user.tags = OutTypes
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
        }
      })
    },
    getUserByName: name => {
      return get().users.find(user => user.username === name)
    },
    // 登录后设置
    setCurrentUser: user => {
      if (!user) return set({ currentUser: null })

      const userInStore = get().users.find(u => u.id === user?.id)
      if (userInStore) {
        set({ currentUser: { ...userInStore, ...user } })
      }
    },
    // 修改个人信息
    updateCurrentUser: user => {
      const _currentUser = { ...get().currentUser!, ...user }
      set({ currentUser: _currentUser })
      get().update(_currentUser)
    },
    EMPTYUSERS: () => {
      set({ users: [] })
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
