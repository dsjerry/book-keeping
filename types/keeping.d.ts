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
  isShow?: boolean
  no?: number
  useToFilter: string[]
}

interface KeepingStore {
  items: KeepingItem[]
  sortBy: SortBy
  sortOrder: SortOrder
  filterBy: string[]
  add: (item: KeepingItem) => void
  remove: (id: string) => void
  removeChecked: () => void
  update: (item: KeepingItem) => void
  toggle: (id: string) => void
  selectAll: () => void
  selectInverse: () => void
  sort: SortChange
  filter: () => void
  setSortBy: (value: SortBy) => void
  setSortOrder: (value: SortOrder) => void
  setFilterBy: (value: string[]) => void
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
  alias: string
}

type SortBy = 'date' | 'amount'

type SortOrder = 'asc' | 'desc'

type SortChange = (value: { sortBy: SortBy; sortOrder: SortOrder }) => void
