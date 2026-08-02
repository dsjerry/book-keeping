import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OutTypes } from '~consts/Data'
import { logging } from '~utils'

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
  updateTag: (tag: OutType) => void
}

export interface UserStore extends UserSettingsSlice, UserInfoSlice {}

const createUserSettingsSlice: StateCreator<UserStore, [], [], UserSettingsSlice> = (set, get) => ({
  useOnline: true,
  tags: [],
  setTags: tags => {
    const current = get().currentUser
    if (!current) return
    // 按 id 去重（对象引用去重对每次新建的 tag 无效）
    const merged = Array.from(new Map([...(current.tags || []), ...tags].map(t => [t.id, t])).values())
    const nextUser: User = { ...current, tags: merged }
    set(state => ({
      currentUser: nextUser,
      users: state.users.map(u => (u.id === nextUser.id ? nextUser : u)),
    }))
    logging.info('[标签] 添加:', tags)
  },
  removeTag: tag => {
    const current = get().currentUser
    if (!current) return
    const nextUser: User = {
      ...current,
      tags: (current.tags || []).filter(t => t.id !== tag.id),
    }
    set(state => ({
      currentUser: nextUser,
      users: state.users.map(u => (u.id === nextUser.id ? nextUser : u)),
    }))
    logging.info('[标签] 删除:', tag)
  },
  updateTag: tag => {
    const current = get().currentUser
    if (!current) return
    const nextUser: User = {
      ...current,
      tags: (current.tags || []).map(t => (t.id === tag.id ? tag : t)),
    }
    set(state => ({
      currentUser: nextUser,
      users: state.users.map(u => (u.id === nextUser.id ? nextUser : u)),
    }))
    logging.info('[标签] 更新:', tag)
  },
})

const createUserInfoSlice: StateCreator<UserStore, [], [], UserInfoSlice> = (set, get) => {
  return {
    users: [],
    currentUser: null,
    add: user => {
      const newUser: User = {
        ...user,
        id: user.id || Date.now().toString(),
        tags: user.tags || OutTypes,
        note: user.note || '这个人很懒，什么也没留下',
      }
      set(state => ({
        users: [...state.users, newUser],
        currentUser: newUser,
      }))
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
