interface KeepingItem {
  id: string
  count: string
  type: 'in' | 'out'
  countType: '人民币' | '港币' | '澳元'
  tags: OutType[]
  date: number
  note: string
  image: string
  isChecked?: boolean
  isShow?: boolean
  no?: number
  useToFilter: string[]
  address?: NearByItem
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

interface NearByItem {
  address: string
  businessarea: string
  direction: string
  distance: string
  id: string
  location: string
  name: string
  poiweight: string
  tel: string[]
  type: string
}

type SortBy = 'date' | 'amount'

type SortOrder = 'asc' | 'desc'

type SortChange = (value: { sortBy: SortBy; sortOrder: SortOrder }) => void
