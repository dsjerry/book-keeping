import { useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { SVGRenderer, SkiaChart, SvgChart } from '@wuba/react-native-echarts'
import type { EChartsOption, EChartsInitOpts } from 'echarts'
import { Card } from 'react-native-paper'

import { DEVICE_WIDTH } from '~consts/Data'

interface ChartsProps {
  data: any
  title?: string
  isShowLabel?: boolean
  labelPosi?: 'outer' | 'inner' | 'outside' | 'center' | 'inside'
  units?: string
}

echarts.use([SVGRenderer, LineChart, GridComponent, PieChart, LegendComponent, BarChart, TitleComponent])

const DEFAULT_INIT: EChartsInitOpts = {
  width: DEVICE_WIDTH * 0.9,
  height: 350,
  renderer: 'svg',
}

const style = StyleSheet.create({
  chartPane: {
    flex: 1,
    paddingTop: 20,
    marginVertical: 10,
  },
})

export const PiePane: React.FC<ChartsProps> = ({
  data,
  isShowLabel = true,
  title = '图表',
  labelPosi = 'outside',
  units = '',
}) => {
  const ref = useRef<any>(null)
  useEffect(() => {
    const option: EChartsOption = {
      title: {
        text: title,
        left: 'center',
      },
      legend: {
        orient: 'horizontal',
        left: 'center',
        top: '15%',
      },
      series: {
        radius: '35%',
        center: ['50%', '60%'],
        type: 'pie',
        data: data,
        label: {
          show: isShowLabel,
          position: labelPosi,
          formatter: '{b}: {c} ' + units,
          fontWeight: 'bold',
        },
      },
    }
    let chart: any
    if (ref.current) {
      chart = echarts.init(ref.current, 'light', {
        ...DEFAULT_INIT,
      })
      chart.setOption(option)
    }
    return () => chart?.dispose()
  }, [])

  return (
    <Card style={style.chartPane}>
      <SvgChart ref={ref} />
    </Card>
  )
}

export const CountBarChart: React.FC<ChartsProps> = ({ data, title }) => {
  const ref = useRef<any>(null)
  useEffect(() => {
    const option: EChartsOption = {
      title: {
        text: title,
        left: 'center',
      },
      xAxis: {
        type: 'category',
        data: data.dates,
        axisLabel: {
          rotate: 0,
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: data.counts,
          type: 'bar',
          barWidth: 30, // 设置柱子的固定宽度为30px
        },
      ],
    }
    let chart: any
    if (ref.current) {
      chart = echarts.init(ref.current, 'light', {
        ...DEFAULT_INIT,
      })
      chart.setOption(option)
    }
    return () => chart?.dispose()
  }, [])

  return (
    <Card style={style.chartPane}>
      <SvgChart ref={ref} />
    </Card>
  )
}

export const RandingChart: React.FC<ChartsProps> = ({ data }) => {
  const ref = useRef<any>(null)
  useEffect(() => {
    const option: EChartsOption = {
      dataset: [
        {
          dimensions: ['name', 'age', 'profession', 'score', 'date'],
          source: [
            ['Hannah Krause', 41, 'Engineer', 314, '2011-02-12'],
            ['Zhao Qian', 20, 'Teacher', 351, '2011-03-01'],
            ['Jasmin Krause ', 52, 'Musician', 287, '2011-02-14'],
            ['Li Lei', 37, 'Teacher', 219, '2011-02-18'],
            ['Karle Neumann', 25, 'Engineer', 253, '2011-04-02'],
            ['Adrian Groß', 19, 'Teacher', '-', '2011-01-16'],
            ['Mia Neumann', 71, 'Engineer', 165, '2011-03-19'],
            ['Böhm Fuchs', 36, 'Musician', 318, '2011-02-24'],
            ['Han Meimei', 67, 'Engineer', 366, '2011-03-12'],
          ],
        },
        {
          transform: {
            type: 'sort',
            config: { dimension: 'score', order: 'desc' },
          },
        },
      ],
      xAxis: {
        type: 'category',
        axisLabel: { interval: 0, rotate: 30 },
      },
      yAxis: {},
      series: {
        type: 'bar',
        encode: { x: 'name', y: 'score' },
        datasetIndex: 1,
      },
    }
    let chart: any
    if (ref.current) {
      chart = echarts.init(ref.current, 'light', {
        ...DEFAULT_INIT,
      })
      chart.setOption(option)
    }
    return () => chart?.dispose()
  }, [])

  return (
    <View style={style.chartPane}>
      <SvgChart ref={ref} />
    </View>
  )
}
