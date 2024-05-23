import { useEffect, useState } from 'react'
import { StyleSheet, ScrollView, View, Text } from 'react-native'
import { Card } from 'react-native-paper'
import { ButtonGroup } from '@rneui/themed'

import { useKeepingStore } from '~store/keepingStore'
import { GetData } from '~utils'
import { _COLORS } from '~consts/Colors'
import { PiePane, CountBarChart } from './components'

const Home = () => {
  const [btnIndex, setBtnIndex] = useState(0)
  const [display, setDisplay] = useState({ count: 0 })
  const { items, output, income, setCounting } = useKeepingStore()

  const chartData = new GetData(items)
  const { tagCounts, aliasCountArray } = chartData.getTags()
  const data = chartData.getDate()

  enum btnText {
    out = '支出',
    in = '收入',
  }

  useEffect(() => {
    setCounting()
    setDisplay({ count: output })
  }, [output, income])

  const onCountTypePress = (index: number) => {
    setBtnIndex(index)
    if (index === 0) {
      setDisplay({ count: output })
    } else {
      setDisplay({ count: income })
    }
  }

  return (
    <ScrollView
      style={homeStyle.container}
      contentContainerStyle={homeStyle.contentContainer}
      centerContent
      snapToAlignment="start">
      {/* 支出/收入 切换 */}
      <Card style={homeStyle.card}>
        <ButtonGroup
          selectedIndex={btnIndex}
          selectedButtonStyle={{ backgroundColor: _COLORS.main }}
          buttons={[btnText.out, btnText.in]}
          onPress={index => onCountTypePress(index)}
          containerStyle={{
            borderRadius: 10,
            backgroundColor: 'transparent',
          }}
        />
      </Card>
      <Card style={[homeStyle.card, countPaneStyle.container]}>
        <View style={countPaneStyle.count}>
          <Text style={countPaneStyle.countNum}>{display.count}</Text>
          <Text>&nbsp;&nbsp;元</Text>
        </View>
        <View></View>
      </Card>
      {/* 各个图表 */}
      <PiePane data={tagCounts} units="次" title="消费类型" />
      <PiePane data={aliasCountArray} units="元" title="金额占比" />
      <CountBarChart data={data} title="消费时间" />
    </ScrollView>
  )
}

const homeStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: _COLORS.sub,
  },
  card: {
    width: '90%',
    marginTop: 20,
  },
})

const countPaneStyle = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 20 },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countNum: { color: _COLORS.main, fontSize: 24, fontWeight: 'bold' },
})

export default Home
