interface KeepingItem {
  id: string
  count: string
  type: 'in' | 'out'
  countType: string
  tags: OutType[]
  date: number
  note: string
  image: string
  isChecked?: boolean
  no?: number
}

interface KeepingStore {
  items: KeepingItem[]
  sortBy: SortBy
  sortOrder: SortOrder
  filterBy: string[]
  add: (item: KeepingItem) => void
  remove: (id: string) => void
  update: (item: KeepingItem) => void
  toggle: (id: string) => void
  sort: SortChange
  filter: () => void
  setSortBy: (value: SortBy) => void
  setSortOrder: (value: SortOrder) => void
}

interface RequestOptions {
  method: 'GET' | 'POST'
  data: any
}

interface OutType {
  id: string
  name: string
  icon: string
  isChecked: boolean
}

type SortBy = 'date' | 'amount'

type SortOrder = 'asc' | 'desc'

type SortChange = (value: { sortBy: SortBy; sortOrder: SortOrder }) => void
