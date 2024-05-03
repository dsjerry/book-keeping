import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logging } from 'utils/logger'

export const useKeepingStore = create<KeepingStore>(set => ({
  items: [],
  // 添加
  add: item => {
    set(state => {
      item.no = state.items.length + 1
      return { items: [...state.items, item] }
    })
  },

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
    logging.info('本地数据:', data)
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
  AsyncStorage.setItem('data', JSON.stringify(state.items))
    .then(() => {
      logging.info('持久化存储成功')
    })
    .catch(err => {
      logging.error(err)
    })
})

export const useAppSettings = create(set => ({}))
