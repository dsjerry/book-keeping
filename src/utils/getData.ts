import _ from 'lodash'
import dayjs from 'dayjs'

const toNumber = (value: string | number): number => Number(value) || 0

// 安全的浮点数加法，避免精度问题
const safeAdd = (a: number, b: number): number => {
  return parseFloat((a + b).toFixed(2))
}

export type TimeFilter = 'all' | 'month' | 'week' | 'day'

class GetData {
  list: KeepingItem[] = []
  // 预先过滤的数据，避免重复计算
  private _expenseList: KeepingItem[] = []
  private _incomeList: KeepingItem[] = []
  // 缓存计算结果
  private _cache: Map<string, any> = new Map()
  // 时间过滤
  private _timeFilter: TimeFilter = 'all'

  constructor(list: KeepingItem[], timeFilter: TimeFilter = 'all') {
    this.list = list
    this._timeFilter = timeFilter
    // 预先过滤支出和收入数据，避免每个方法重复过滤
    this._expenseList = this.filterByTime(list.filter(item => item.type === 'out'))
    this._incomeList = this.filterByTime(list.filter(item => item.type === 'in'))
  }

  // 根据时间过滤数据
  private filterByTime(list: KeepingItem[]): KeepingItem[] {
    if (this._timeFilter === 'all') {
      return list
    }

    const now = dayjs()
    let startDate: dayjs.Dayjs

    switch (this._timeFilter) {
      case 'day':
        startDate = now.startOf('day')
        break
      case 'week':
        startDate = now.startOf('week')
        break
      case 'month':
        startDate = now.startOf('month')
        break
      default:
        return list
    }

    return list.filter(item => dayjs(item.date).isAfter(startDate) || dayjs(item.date).isSame(startDate, 'day'))
  }

  // 设置时间过滤器并清除缓存
  setTimeFilter(filter: TimeFilter) {
    if (this._timeFilter !== filter) {
      this._timeFilter = filter
      // 重新过滤数据
      this._expenseList = this.filterByTime(this.list.filter(item => item.type === 'out'))
      this._incomeList = this.filterByTime(this.list.filter(item => item.type === 'in'))
      this.clearCache()
    }
  }

  // 获取指定类型的列表
  private getList(isIncome: boolean): KeepingItem[] {
    return isIncome ? this._incomeList : this._expenseList
  }

  // 清除缓存（当数据变化时调用）
  clearCache() {
    this._cache.clear()
  }

  getTags(isIncome = false) {
    const cacheKey = `tags_${isIncome}`
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey)
    }

    const list = this.getList(isIncome)

    // 一次遍历完成所有计算，减少循环次数
    const tagName = {} as AnyObj
    const aliasCountMap = {} as AnyObj

    list.forEach(item => {
      const count = toNumber(item.count)
      item.tags.forEach(tag => {
        // 统计次数
        tagName[tag.name] = (tagName[tag.name] || 0) + 1
        // 统计金额（使用安全加法避免浮点数精度问题）
        aliasCountMap[tag.name] = safeAdd(aliasCountMap[tag.name] || 0, count)
      })
    })

    const tagCounts = Object.keys(tagName).map(key => ({
      name: key,
      value: tagName[key],
    }))

    const aliasCountArray = Object.keys(aliasCountMap).map(alias => ({
      name: alias,
      value: aliasCountMap[alias],
    }))

    const result = { tagCounts, aliasCountArray }
    this._cache.set(cacheKey, result)
    return result
  }

  getDate(isIncome = false) {
    const cacheKey = `date_${isIncome}`
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey)
    }

    const list = this.getList(isIncome)

    const dateCounts = list.reduce((acc: AnyObj, item) => {
      const date = dayjs(item.date).format('YYYY-MM-DD')
      acc[date] = safeAdd(acc[date] || 0, toNumber(item.count))
      return acc
    }, {})

    const result = {
      dates: Object.keys(dateCounts),
      counts: Object.values(dateCounts) as number[],
    }

    this._cache.set(cacheKey, result)
    return result
  }

  // 获取消费地点分布数据
  getLocation(isIncome = false) {
    const cacheKey = `location_${isIncome}`
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey)
    }

    const list = this.getList(isIncome)

    // 按地点分组并统计金额
    const locationMap = {} as AnyObj

    list.forEach(item => {
      // 如果没有地点信息，归类为"未知地点"
      const location = item.address?.name || '未知地点'
      locationMap[location] = safeAdd(locationMap[location] || 0, toNumber(item.count))
    })

    // 转换为图表所需的数据格式
    const locationData = Object.keys(locationMap).map(location => ({
      name: location,
      value: locationMap[location],
    }))

    // 按金额从大到小排序
    const result = locationData.sort((a, b) => b.value - a.value)
    this._cache.set(cacheKey, result)
    return result
  }
}

export { GetData, TimeFilter }
