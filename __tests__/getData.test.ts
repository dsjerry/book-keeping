import { GetData } from '~utils/getData'

const makeItem = (overrides: Partial<KeepingItem> = {}): KeepingItem => ({
  id: '1',
  count: '12.50',
  type: 'out',
  countType: '人民币',
  tags: [
    {
      id: 't1',
      name: '餐饮',
      icon: 'food-outline',
      isChecked: false,
      alias: 'food',
    },
  ],
  date: new Date('2026-08-01T12:00:00').getTime(),
  note: '',
  image: '',
  ...overrides,
})

describe('GetData', () => {
  it('keeps decimal amounts when aggregating tag amounts', () => {
    const { aliasCountArray } = new GetData([
      makeItem({ count: '10.50' }),
      makeItem({ count: '3.25' }),
    ]).getTags()
    expect(aliasCountArray.find(t => t.name === '餐饮')?.value).toBe(13.75)
  })

  it('groups by date and sums decimal amounts', () => {
    const day1 = new Date('2026-08-01T12:00:00').getTime()
    const day2 = new Date('2026-08-02T12:00:00').getTime()
    const { dates, counts } = new GetData([
      makeItem({ count: '10.50', date: day1 }),
      makeItem({ count: '5.50', date: day1 }),
      makeItem({ count: '2.00', date: day2 }),
    ]).getDate()
    expect(dates).toHaveLength(2)
    expect(counts).toEqual(expect.arrayContaining([16, 2]))
  })

  it('falls back to unknown location and sorts by amount desc', () => {
    const data = new GetData([
      makeItem({ count: '5', address: { name: '餐厅' } as NearByItem }),
      makeItem({ count: '20' }),
      makeItem({ count: '10', address: { name: '超市' } as NearByItem }),
    ]).getLocation()
    expect(data[0].name).toBe('未知地点')
    expect(data[0].value).toBe(20)
  })
})
