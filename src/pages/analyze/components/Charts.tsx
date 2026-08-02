import { useEffect, useRef, useState, memo } from 'react'
import { View, StyleSheet, LayoutChangeEvent } from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { SVGRenderer, SvgChart } from '@wuba/react-native-echarts'
import type { EChartsOption, EChartsInitOpts } from 'echarts'
import { Card, useTheme } from 'react-native-paper'

interface ChartsProps {
  data: any
  title?: string
  isShowLabel?: boolean
  labelPosi?: 'outer' | 'inner' | 'outside' | 'center' | 'inside'
  units?: string
}

echarts.use([SVGRenderer, LineChart, GridComponent, PieChart, LegendComponent, BarChart, TitleComponent])

const CHART_HEIGHT = 300

const style = StyleSheet.create({
  chartPane: {
    borderRadius: 12,
    marginVertical: 10,
    paddingTop: 20,
    overflow: 'hidden',
  },
  chartWrapper: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export const PiePane: React.FC<ChartsProps> = memo(
  ({ data, isShowLabel = true, title = '图表', labelPosi = 'outside', units = '' }) => {
    const theme = useTheme()
    const ref = useRef<any>(null)
    const [chartWidth, setChartWidth] = useState(0)

    const onLayout = (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width
      if (w > 0 && w !== chartWidth) {
        setChartWidth(w)
      }
    }

    useEffect(() => {
      if (!ref.current || chartWidth <= 0) return
      const initOpts: EChartsInitOpts = {
        width: chartWidth - 32,
        height: CHART_HEIGHT - 40,
        renderer: 'svg',
      }
      const option: EChartsOption = {
        backgroundColor: 'transparent',
        title: {
          text: title,
          left: 'center',
          textStyle: { color: theme.colors.onSurface },
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          top: '22%',
          textStyle: { color: theme.colors.onSurfaceVariant },
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
            color: theme.colors.onSurface,
          },
        },
      }
      let chart: any
      chart = echarts.init(ref.current, theme.dark ? 'dark' : 'light', initOpts)
      chart.setOption(option)
      return () => chart?.dispose()
    }, [
      theme.dark,
      chartWidth,
      data,
      title,
      isShowLabel,
      labelPosi,
      units,
      theme.colors.onSurface,
      theme.colors.onSurfaceVariant,
    ])

    return (
      <Card style={style.chartPane} onLayout={onLayout}>
        <View style={style.chartWrapper}>
          <SvgChart ref={ref} />
        </View>
      </Card>
    )
  },
)

export const CountBarChart: React.FC<ChartsProps> = memo(({ data, title }) => {
  const theme = useTheme()
  const ref = useRef<any>(null)
  const [chartWidth, setChartWidth] = useState(0)

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0 && w !== chartWidth) {
      setChartWidth(w)
    }
  }

  useEffect(() => {
    if (!ref.current || chartWidth <= 0) return
    const initOpts: EChartsInitOpts = {
      width: chartWidth - 32,
      height: CHART_HEIGHT - 40,
      renderer: 'svg',
    }
    const option: EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 'center',
        textStyle: { color: theme.colors.onSurface },
      },
      xAxis: {
        type: 'category',
        data: data.dates,
        axisLabel: {
          rotate: 0,
          color: theme.colors.onSurfaceVariant,
        },
        axisLine: { lineStyle: { color: theme.colors.outlineVariant } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: theme.colors.onSurfaceVariant },
        splitLine: { lineStyle: { color: theme.colors.outlineVariant } },
      },
      series: [
        {
          data: data.counts,
          type: 'bar',
          barWidth: 30,
          itemStyle: { color: theme.colors.primary },
        },
      ],
    }
    let chart: any
    chart = echarts.init(ref.current, theme.dark ? 'dark' : 'light', initOpts)
    chart.setOption(option)
    return () => chart?.dispose()
  }, [
    theme.dark,
    chartWidth,
    data,
    title,
    theme.colors.onSurface,
    theme.colors.onSurfaceVariant,
    theme.colors.outlineVariant,
    theme.colors.primary,
  ])

  return (
    <Card style={style.chartPane} onLayout={onLayout}>
      <View style={style.chartWrapper}>
        <SvgChart ref={ref} />
      </View>
    </Card>
  )
})
