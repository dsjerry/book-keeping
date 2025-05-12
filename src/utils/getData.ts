import _ from 'lodash'
import dayjs from 'dayjs'

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
      const count = parseInt(item.count)

      item.tags.forEach(tag => {
        if (aliasCountMap[tag.name]) {
          aliasCountMap[tag.name] += count
        } else {
          aliasCountMap[tag.name] = count
        }
      })
    })

    const aliasCountArray = Object.keys(aliasCountMap).map(alias => {
      return { name: alias, value: aliasCountMap[alias] }
    })

    return { tagCounts, aliasCountArray }
  }

  getDate(isIncome = false) {
    let _list = null
    if (isIncome) {
      _list = this.list.filter(item => item.type === 'in')
    } else {
      _list = this.list.filter(item => item.type === 'out')
    }

    const processedData = _list.map(item => {
      const date = dayjs(item.date).format('YYYY-MM-DD')
      return {
        date: date, // 日期 x轴
        count: parseInt(item.count), // 花费 y轴
      }
    })

    const dateCounts = processedData.reduce((acc: AnyObj, { date, count }) => {
      if (!acc[date]) acc[date] = 0
      acc[date] += count
      return acc
    }, {})

    const dates = Object.keys(dateCounts)
    const counts = dates.map(date => dateCounts[date])

    return { dates, counts }
  }

  // 获取消费地点分布数据
  getLocation(isIncome = false) {
    // 根据收入/支出类型筛选数据
    let _list = null
    if (isIncome) {
      _list = this.list.filter(item => item.type === 'in')
    } else {
      _list = this.list.filter(item => item.type === 'out')
    }

    // 按地点分组并统计金额
    const locationMap = {} as AnyObj
    
    _list.forEach(item => {
      // 如果没有地点信息，归类为"未知地点"
      const location = item.address?.name || '未知地点'
      const count = parseInt(item.count)
      
      if (locationMap[location]) {
        locationMap[location] += count
      } else {
        locationMap[location] = count
      }
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
