jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

import { useKeepingStore, userUsersKeepingStore } from '~store/keepingStore'
import { OutTypes } from '~consts/Data'

const makeItem = (overrides: Partial<KeepingItem> = {}): KeepingItem => ({
  id: `id-${Math.random().toString(36).slice(2)}`,
  count: '10.5',
  type: 'out',
  countType: '人民币',
  tags: [OutTypes[0]],
  date: Date.now(),
  note: '',
  image: '',
  ...overrides,
})

describe('keepingStore', () => {
  beforeEach(() => {
    useKeepingStore.setState({ items: [] })
    userUsersKeepingStore.setState({ items: [] })
  })

  it('addItems merges incoming items with existing ones by id', () => {
    useKeepingStore.getState().addItems([makeItem({ id: 'a' })])
    useKeepingStore.getState().addItems([makeItem({ id: 'b' })])
    const ids = useKeepingStore.getState().items.map(i => i.id)
    expect(ids).toHaveLength(2)
    expect(ids).toEqual(expect.arrayContaining(['a', 'b']))
  })

  it('setCounting sums decimal amounts without truncation', () => {
    useKeepingStore.getState().addItems([
      makeItem({ id: 'a', type: 'out', count: '10.5' }),
      makeItem({ id: 'b', type: 'in', count: '20.25' }),
      makeItem({ id: 'c', type: 'out', count: '3.75' }),
    ])
    useKeepingStore.getState().setCounting()
    const { record, output, income } = useKeepingStore.getState()
    expect(record).toBe(3)
    expect(output).toBe(14.25)
    expect(income).toBe(20.25)
  })

  it('saves user keeping for a brand new user (append instead of drop)', () => {
    userUsersKeepingStore.getState().add({ userid: 'u1', keeping: [] })
    expect(userUsersKeepingStore.getState().get('u1')).toBeDefined()
    userUsersKeepingStore
      .getState()
      .add({ userid: 'u1', keeping: [makeItem()] })
    expect(userUsersKeepingStore.getState().items).toHaveLength(1)
    expect(userUsersKeepingStore.getState().get('u1')?.keeping).toHaveLength(1)
  })
})
