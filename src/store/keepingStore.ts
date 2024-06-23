import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'

import { CountType } from '~consts/Data'

export type FilterBy = string

interface SortSlice {
  sortBy: SortBy
  sortOrder: 'asc' | 'desc'
  setSortBy: (value: SortBy) => void
  setSortOrder: (value: 'asc' | 'desc') => void
}

interface FilterSlice {
  filterBy: FilterBy[]
  setFilterBy: (value: FilterBy[]) => void
}

interface KeepingSlice {
  items: KeepingItem[]
  add: (item: KeepingItem) => void
  addItems: (items: KeepingItem[]) => void
  clearItems: () => void
  remove: (id: string) => void
  removeChecked: () => void
  update: (item: KeepingItem) => void
  toggle: (id: string) => void
  selectAll: () => void
  selectInverse: () => void
  sort: SortChange
  filter: () => void
}

interface CountingSlice {
  record: number
  output: number
  income: number
  setCounting: () => void
}

export interface CommonSlice
  extends SortSlice,
    FilterSlice,
    KeepingSlice,
    CountingSlice {}

const createCountingSlice: StateCreator<CommonSlice, [], [], CountingSlice> = (
  set,
  get,
) => ({
  record: 0,
  output: 0,
  income: 0,
  setCounting: () => {
    const items = get().items
    const outputItem = items.filter(item => item.type === 'out')
    const incomeItem = items.filter(item => item.type === 'in')

    let output = 0,
      income = 0
    outputItem.forEach(item => {
      output += parseFloat(item.count)
    })
    incomeItem.forEach(item => {
      income += parseFloat(item.count)
    })

    set({ record: items.length, output, income })
  },
})

const createSortSlice: StateCreator<CommonSlice, [], [], SortSlice> = set => ({
  sortBy: 'date',
  sortOrder: 'asc',
  setSortBy: sortBy => set({ sortBy }),
  setSortOrder: sortOrder => set({ sortOrder }),
})

const createFilterSlice: StateCreator<
  CommonSlice,
  [],
  [],
  FilterSlice
> = set => ({
  filterBy: [],
  setFilterBy: filterBy => set({ filterBy }),
})

const createKeepingSlice: StateCreator<CommonSlice, [], [], KeepingSlice> = (
  set,
  get,
) => ({
  items: [],
  add: item => {
    set(state => {
      item.id = Date.now().toString()
      item.date = Date.now()
      item.no = state.items.length + 1
      item.useToFilter = [
        ...item.tags.map(item => item.alias),
        CountType[item.countType],
      ]
      return { items: [...state.items, item] }
    })

    get().sort({ sortBy: get().sortBy, sortOrder: get().sortOrder })
  },
  addItems: items => {
    set(state => ({ items: [...items] }))
  },
  clearItems: () => {
    set({ items: [] })
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
        let useToFilter = items[i].useToFilter
        if (useToFilter.includes(filterBy[j])) {
          items[i].isShow = true
        } else {
          items[i].isShow = false
        }
      }
    }
    set(state => ({ ...state, items }))
  },
})

export const useKeepingStore = create<CommonSlice>()(
  persist(
    (...a) => ({
      ...createSortSlice(...a),
      ...createFilterSlice(...a),
      ...createKeepingSlice(...a),
      ...createCountingSlice(...a),
    }),
    {
      name: `keeping`,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ items: state.items }),
    },
  ),
)

interface UsersKeeping {
  userid: string
  keeping: KeepingItem[]
}

interface UsersKeepingSlice {
  items: UsersKeeping[]
  add: (item: UsersKeeping) => void
  get: (userid: string) => UsersKeeping | void
  remove: (userid: string) => void
}

export const userUsersKeepingStore = create<UsersKeepingSlice>()(
  persist(
    (set, get) => ({
      items: [],
      add: item => {
        const arr = get().items.map(user => {
          if (user.userid === item.userid) {
            return item
          } else {
            return user
          }
        })

        set({ items: arr })
      },
      get(userid) {
        return get().items.find(item => item.userid === userid)
      },
      remove: userid => {
        set(state => ({
          items: state.items.filter(item => item.userid !== userid),
        }))
      },
    }),
    {
      name: `users-keeping`,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ items: state.items }),
    },
  ),
)
