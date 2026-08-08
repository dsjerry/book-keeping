import { useEffect, useRef, useState, memo, useCallback } from 'react'
import { View, StyleSheet, LayoutChangeEvent } from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { SVGRenderer, SvgChart } from '@wuba/react-native-echarts'
import type { EChartsOption, EChartsInitOpts } from 'echarts'
import { Card, useTheme } from 'react-native-paper'
import { withAlpha } from '~utils'

interface ChartsProps {
  data: any
  title?: string
  isShowLabel?: boolean
  labelPosi?: 'outer' | 'inner' | 'outside' | 'center' | 'inside'
  units?: string
}

echarts.use([SVGRenderer, LineChart, GridComponent, PieChart, LegendComponent, BarChart, TitleComponent])

const CHART_HEIGHT = 300

// 图表性能优化Hook：懒加载和防抖
const useChartPerformance = (delay = 300) => {
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // 延迟显示图表，避免同时渲染多个图表导致卡顿
    timerRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [delay])

  return isVisible
}

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
  // LocationBarChart 使用的动态高度样式
  dynamicChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export const PiePane: React.FC<ChartsProps> = memo(
  ({ data, isShowLabel = true, title = '图表', labelPosi = 'outside', units = '' }) => {
    const theme = useTheme()
    const ref = useRef<any>(null)
    const [chartWidth, setChartWidth] = useState(0)
    const isVisible = useChartPerformance(100) // 延迟100ms渲染

    const onLayout = useCallback((e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width
      if (w > 0 && w !== chartWidth) {
        setChartWidth(w)
      }
    }, [chartWidth])

    useEffect(() => {
      if (!ref.current || chartWidth <= 0 || !isVisible) return

      const initOpts: EChartsInitOpts = {
        width: chartWidth - 32,
        height: CHART_HEIGHT - 40,
        renderer: 'svg',
      }
      const option: EChartsOption = {
        backgroundColor: 'transparent',
        color: [
          theme.colors.tertiary,
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.tertiaryContainer,
          theme.colors.primaryContainer,
          theme.colors.error,
        ],
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
      isVisible,
      data,
      title,
      isShowLabel,
      labelPosi,
      units,
      theme.colors.onSurface,
      theme.colors.onSurfaceVariant,
      theme.colors.tertiary,
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.tertiaryContainer,
      theme.colors.primaryContainer,
      theme.colors.error,
    ])

    return (
      <Card style={style.chartPane} onLayout={onLayout}>
        <View style={style.chartWrapper}>
          {isVisible && <SvgChart ref={ref} />}
        </View>
      </Card>
    )
  },
)

/** 折线图（消费时间趋势） */
export const CountBarChart: React.FC<ChartsProps> = memo(({ data, title }) => {
  const theme = useTheme()
  const ref = useRef<any>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const isVisible = useChartPerformance(200) // 延迟200ms渲染

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0 && w !== chartWidth) {
      setChartWidth(w)
    }
  }, [chartWidth])

  useEffect(() => {
    if (!ref.current || chartWidth <= 0 || !isVisible) return

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
          type: 'line',
          smooth: true,
          symbolSize: 6,
          lineStyle: { color: theme.colors.tertiary, width: 2.5 },
          itemStyle: { color: theme.colors.tertiary },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: withAlpha(theme.colors.tertiary, 0.25) },
                { offset: 1, color: withAlpha(theme.colors.tertiary, 0.02) },
              ],
            },
          },
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
    isVisible,
    data,
    title,
    theme.colors.onSurface,
    theme.colors.onSurfaceVariant,
    theme.colors.outlineVariant,
    theme.colors.tertiary,
  ])

  return (
    <Card style={style.chartPane} onLayout={onLayout}>
      <View style={style.chartWrapper}>
        {isVisible && <SvgChart ref={ref} />}
      </View>
    </Card>
  )
})

/** 水平柱状图（消费地点分布） */
export const LocationBarChart: React.FC<ChartsProps> = memo(({ data, title = '图表', units = '' }) => {
  const theme = useTheme()
  const ref = useRef<any>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const [chartHeight, setChartHeight] = useState(CHART_HEIGHT)
  const isVisible = useChartPerformance(300) // 延迟300ms渲染，让前两个图表先渲染

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0 && w !== chartWidth) {
      setChartWidth(w)
    }
  }, [chartWidth])

  useEffect(() => {
    if (!ref.current || chartWidth <= 0 || !isVisible) return

    // 按金额降序排序，取前 10 条
    const sorted = [...(data || [])].sort((a: any, b: any) => b.value - a.value).slice(0, 10)
    // 根据数据量动态计算图表高度：每项至少30px，上限400px
    const dataCount = sorted.length
    const dynamicHeight = Math.min(Math.max(dataCount * 30 + 100, 200), 400)
    setChartHeight(dynamicHeight)

    const initOpts: EChartsInitOpts = {
      width: chartWidth - 32,
      height: dynamicHeight - 40,
      renderer: 'svg',
    }

    // 根据数据量动态计算柱子宽度
    const barWidth = dataCount <= 5 ? 20 : dataCount <= 8 ? 16 : 12

    const option: EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 'center',
        textStyle: { color: theme.colors.onSurface },
      },
      grid: { left: 90, right: 30, top: 50, bottom: 20 },
      xAxis: {
        type: 'value',
        axisLabel: { color: theme.colors.onSurfaceVariant, fontSize: 11 },
        splitLine: { lineStyle: { color: theme.colors.outlineVariant } },
      },
      yAxis: {
        type: 'category',
        data: sorted.map((d: any) => d.name).reverse(),
        axisLabel: { color: theme.colors.onSurfaceVariant, fontSize: 12, width: 80, overflow: 'truncate' },
        axisLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: sorted.map((d: any) => ({
            value: d.value,
            itemStyle: { color: theme.colors.tertiary, borderRadius: [0, 4, 4, 0] },
          })),
          barWidth: barWidth,
          label: {
            show: true,
            position: 'right',
            formatter: `{c}${units}`,
            fontSize: 11,
            color: theme.colors.onSurfaceVariant,
          },
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
    isVisible,
    data,
    title,
    units,
    theme.colors.onSurface,
    theme.colors.onSurfaceVariant,
    theme.colors.outlineVariant,
    theme.colors.tertiary,
  ])

  return (
    <Card style={style.chartPane} onLayout={onLayout}>
      <View style={[style.dynamicChartWrapper, { height: chartHeight }]}>
        {isVisible && <SvgChart ref={ref} />}
      </View>
    </Card>
  )
})
