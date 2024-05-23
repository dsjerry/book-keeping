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

  getDate() {
    const processedData = this.list.map(item => {
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
}

export { GetData }
