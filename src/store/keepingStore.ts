import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import _ from 'lodash'
import { logging } from '~utils'

interface SortSlice {
  sortBy: SortBy
  sortOrder: 'asc' | 'desc'
  setSortBy: (value: SortBy) => void
  setSortOrder: (value: 'asc' | 'desc') => void
}

interface FilterSlice {
  filterBy: string[]
  setFilterBy: (value: string[]) => void
}

interface KeepingSlice {
  items: KeepingItem[]
  add: (item: KeepingItem) => void
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
        logging.info(items[i])
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
