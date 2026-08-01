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
    let output = 0
    let income = 0
    items.forEach(item => {
      const amount = Number(item.count) || 0
      if (item.type === 'out') {
        output += amount
      } else if (item.type === 'in') {
        income += amount
      }
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
    const newItem: KeepingItem = {
      ...item,
      id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: item.date || Date.now(),
      no: item.no || get().items.length + 1,
      useToFilter: [
        ...item.tags.map(tag => tag.alias),
        CountType[item.countType],
      ],
    }
    set(state => ({ items: [...state.items, newItem] }))

    get().sort({ sortBy: get().sortBy, sortOrder: get().sortOrder })
  },
  // 合并批量数据（登录后加载 / 服务端同步），按 id 去重并保留本地已有记录
  addItems: incoming => {
    set(state => {
      const incomingIds = new Set(incoming.map(item => item.id))
      const existing = state.items.filter(item => !incomingIds.has(item.id))
      return { items: [...existing, ...incoming] }
    })
  },
  clearItems: () => {
    set({ items: [] })
  },
  remove: id => {
    // 软删除，等待同步时上报服务端
    set(state => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, syncStatus: 'deleted' } : item,
      ),
    }))
  },
  removeChecked: () => {
    set(state => ({
      items: state.items.map(item =>
        item.isChecked
          ? { ...item, isChecked: false, syncStatus: 'deleted' as SyncStatus }
          : item,
      ),
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
    set(state => ({
      items: state.items.map(item => ({ ...item, isChecked: true })),
    }))
  },
  selectInverse: () => {
    set(state => ({
      items: state.items.map(item => ({
        ...item,
        isChecked: !item.isChecked,
      })),
    }))
  },
  sort: ({ sortBy, sortOrder }) => {
    const items = get().items
    let sorted = items
    // 按日期排序
    if (sortBy === 'date') {
      sorted = _.orderBy(items, 'date', sortOrder)
    }
    // 按金额排序
    else if (sortBy === 'amount') {
      sorted = _.orderBy(items, 'count', sortOrder)
    }
    set({ items: sorted })
  },
  filter: () => {
    const filterBy = get().filterBy
    set(state => ({
      items: state.items.map(item => {
        if (filterBy.length === 0) {
          return { ...item, isShow: true }
        }
        const shouldShow = filterBy.some(f => item.useToFilter?.includes(f))
        return { ...item, isShow: shouldShow }
      }),
    }))
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
        set(state => {
          const exists = state.items.some(user => user.userid === item.userid)
          return exists
            ? {
                items: state.items.map(user =>
                  user.userid === item.userid ? item : user,
                ),
              }
            : { items: [...state.items, item] }
        })
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
