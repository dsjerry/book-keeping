import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useKeepingStore = create<KeepingStore>(set => ({
  items: [],
  // 添加
  add: item => set(state => ({ items: [...state.items, item] })),
  // 删除
  remove: id => {
    set(state => ({ items: state.items.filter(item => item.id !== id) }))
  },
  // 更新
  update: item => {
    set(state => ({
      items: state.items.map(i => (i.id === item.id ? item : i)),
    }))
  },
  // 点击
  toggle: id => {
    set(state => ({
      items: state.items.map(i =>
        i.id === id ? { ...i, isChecked: !i.isChecked } : i,
      ),
    }))
  },
  load: async () => {
    const data = await AsyncStorage.getItem('data')
    set({ items: data ? JSON.parse(data) : [] })
  },
  save: async (data: KeepingItem[]) => {
    await AsyncStorage.setItem('data', JSON.stringify(data))
  },
}))

export const useUserStore = create<User & UserStoreAction>(set => ({
  username: '',
  password: '',
  avatar: '',
  note: '这个人很懒，什么也没留下',
  add: user => set(state => ({ ...state, ...user })),
  update: user => set(state => ({ ...state, ...user })),
  remove: id => set(state => ({ ...state, username: '' })),
}))

const unsub = useKeepingStore.subscribe((state, prevState) => {
  console.log('变化', state, prevState)
})

export const useAppSettings = create(set => ({}))
