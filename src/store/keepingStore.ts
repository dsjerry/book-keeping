import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'

export const useKeepingStore = create<KeepingStore>()(
  persist(
    (set, get) => ({
      items: [],
      sortBy: 'date',
      sortOrder: 'asc',
      filterBy: [],
      add: item => {
        set(state => {
          item.no = state.items.length + 1
          return { items: [...state.items, item] }
        })
      },
      remove: id => {
        set(state => ({ items: state.items.filter(item => item.id !== id) }))
      },
      update: item => {
        set(state => ({
          items: state.items.map(i => (i.id === item.id ? item : i)),
        }))
      },
      toggle: id => {
        set(state => ({
          items: state.items.map(i =>
            i.id === id ? { ...i, isChecked: !i.isChecked } : i,
          ),
        }))
      },
      setSortBy: sortBy => set({ sortBy }),
      setSortOrder: sortOrder => set({ sortOrder }),
      sort: ({ sortBy, sortOrder }) => {
        let items = get().items
        // 按日期排序
        if (sortBy === 'date') {
          items = _.orderBy(items, 'date', sortOrder)
        }
        // 按金额排序
        else if (sortBy === 'amount') {
          items = _.orderBy(items, 'count', sortOrder)
        }
        set({ items })
      },
      filter: () => {},
    }),
    {
      name: 'keeping',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ items: state.items }),
    },
  ),
)
