import { useEffect, useState, useRef } from 'react'
import { StyleSheet, ScrollView, View, Text } from 'react-native'
import { Card, Button } from 'react-native-paper'
import { ButtonGroup } from '@rneui/themed'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'

import { useKeepingStore } from '~store/keepingStore'
import { GetData } from '~utils'
import { _COLORS } from '~consts/Colors'
import { PiePane, CountBarChart, LoadingIndicator } from './components'

const Home = () => {
  const [btnIndex, setBtnIndex] = useState(0)
  const [display, setDisplay] = useState({ count: 0 })
  const [loading, setLoading] = useState(true)

  const { items, output, income, setCounting } = useKeepingStore()

  const shareRef = useRef<any>(null)

  const chartData = new GetData(items)
  const { tagCounts, aliasCountArray } = chartData.getTags()
  const data = chartData.getDate()

  useEffect(() => {
    setCounting()
    setDisplay({ count: output })

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [output, income])

  const onCountTypePress = (index: number) => {
    setBtnIndex(index)
    if (index === 0) {
      setDisplay({ count: output })
    } else {
      setDisplay({ count: income })
    }
  }

  const onShare = async () => {
    try {
      const uri = await captureRef(shareRef.current, {
        format: 'png',
        quality: 0.8,
      })

      const shareOptions = {
        title: '分享到',
        url: uri,
        failOnCancel: false,
      }

      await Share.open(shareOptions)
    } catch (error) {
      console.error('捕获失败:', error)
    }
  }

  return (
    <ScrollView
      style={homeStyle.container}
      contentContainerStyle={homeStyle.contentContainer}
      centerContent
      snapToAlignment="start">
      <LoadingIndicator animating={loading} />
      {!loading && (
        <>
          {/* 支出/收入 切换 */}
          <Card style={homeStyle.card}>
            <ButtonGroup
              selectedIndex={btnIndex}
              selectedButtonStyle={{ backgroundColor: _COLORS.main }}
              buttons={['支出', '收入']}
              onPress={index => onCountTypePress(index)}
              containerStyle={{
                borderRadius: 10,
                backgroundColor: 'transparent',
              }}
            />
          </Card>
          <View style={homeStyle.sharepane} collapsable={false} ref={shareRef}>
            <Card style={[homeStyle.card, countPaneStyle.container]}>
              <View style={countPaneStyle.count}>
                <Text style={countPaneStyle.countNum}>{display.count}</Text>
                <Text>&nbsp;&nbsp;元</Text>
              </View>
            </Card>
            {/* 各个图表 */}
            <PiePane data={tagCounts} units="次" title="消费类型" />
            <PiePane data={aliasCountArray} units="元" title="金额占比" />
            <CountBarChart data={data} title="消费时间" />
          </View>
          <View>
            <Button icon={'share'} mode="text" onPress={onShare}>
              {'分享'}
            </Button>
          </View>
        </>
      )}
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
  sharepane: {
    flex: 1,
    backgroundColor: _COLORS.sub,
  },
})

const countPaneStyle = StyleSheet.create({
  container: { width: 'auto', paddingHorizontal: 20, paddingVertical: 20 },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countNum: { color: _COLORS.main, fontSize: 24, fontWeight: 'bold' },
})

export default Home
