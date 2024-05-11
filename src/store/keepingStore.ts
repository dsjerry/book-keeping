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
      removeChecked: () => {
        const items = get().items
        set(state => ({
          items: items.filter(item => !item.isChecked),
        }))
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
      selectAll: () => {
        const items = get().items
        items.forEach(item => {
          item.isChecked = true
        })
        set(state => ({ ...state, items }))
      },
      selectInverse: () => {
        const items = get().items
        items.forEach(item => {
          item.isChecked = !item.isChecked
        })
        set(state => ({ ...state, items }))
      },
      setSortBy: sortBy => set({ sortBy }),
      setSortOrder: sortOrder => set({ sortOrder }),
      setFilterBy: filterBy =>
        set(state => {
          return { ...state, filterBy }
        }),
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
      filter: () => {
        const items = get().items
        const filterBy = get().filterBy
        if (filterBy.length === 0) {
          items.forEach(item => {
            item.isShow = true
          })
          return set(state => ({ ...state, items }))
        }
        for (let i = 0; i < items.length; i++) {
          for (let j = 0; j < filterBy.length; j++) {
            let outtype = items[i].tags
            outtype.forEach(item => {
              if (item.alias !== filterBy[j]) {
                items[i].isShow = false
              } else {
                items[i].isShow = true
              }
            })
          }
        }
        set(state => ({ ...state, items }))
      },
    }),
    {
      name: 'keeping',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ items: state.items }),
    },
  ),
)
