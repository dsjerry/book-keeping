interface KeepingItem {
  id: string
  count: number
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
  add: (item: KeepingItem) => void
  remove: (id: string) => void
  update: (item: KeepingItem) => void
  toggle: (id: string) => void
  load: () => void
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
