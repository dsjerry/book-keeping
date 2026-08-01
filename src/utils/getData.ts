import _ from 'lodash'
import dayjs from 'dayjs'

const toNumber = (value: string | number): number => Number(value) || 0

class GetData {
  list: KeepingItem[] = []

  constructor(list: KeepingItem[]) {
    this.list = list
  }

  getTags() {
    const tagsArr = this.list.map(item => item.tags).flat()
    const tagName = _.countBy(tagsArr, 'name')
    const tagCounts = Object.keys(tagName).map(key => {
      return {
        name: key,
        value: tagName[key],
      }
    })

    const aliasCountMap = {} as AnyObj

    this.list.forEach(item => {
      const count = toNumber(item.count)
      item.tags.forEach(tag => {
        aliasCountMap[tag.name] = (aliasCountMap[tag.name] || 0) + count
      })
    })

    const aliasCountArray = Object.keys(aliasCountMap).map(alias => {
      return { name: alias, value: aliasCountMap[alias] }
    })

    return { tagCounts, aliasCountArray }
  }

  getDate(isIncome = false) {
    const list = isIncome
      ? this.list.filter(item => item.type === 'in')
      : this.list.filter(item => item.type === 'out')

    const dateCounts = list.reduce((acc: AnyObj, item) => {
      const date = dayjs(item.date).format('YYYY-MM-DD')
      acc[date] = (acc[date] || 0) + toNumber(item.count)
      return acc
    }, {})

    return {
      dates: Object.keys(dateCounts),
      counts: Object.values(dateCounts) as number[],
    }
  }

  // 获取消费地点分布数据
  getLocation(isIncome = false) {
    const list = isIncome
      ? this.list.filter(item => item.type === 'in')
      : this.list.filter(item => item.type === 'out')

    // 按地点分组并统计金额
    const locationMap = {} as AnyObj

    list.forEach(item => {
      // 如果没有地点信息，归类为"未知地点"
      const location = item.address?.name || '未知地点'
      locationMap[location] = (locationMap[location] || 0) + toNumber(item.count)
    })

    // 转换为图表所需的数据格式
    const locationData = Object.keys(locationMap).map(location => {
      return { name: location, value: locationMap[location] }
    })

    // 按金额从大到小排序
    return locationData.sort((a, b) => b.value - a.value)
  }
}

export { GetData }
