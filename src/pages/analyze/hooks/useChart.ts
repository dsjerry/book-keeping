import { useEffect, useRef } from 'react'
import * as ECHARTS from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent } from 'echarts/components'
import { SVGRenderer, SkiaChart, SvgChart } from '@wuba/react-native-echarts'
import type { EChartsOption, EChartsInitOpts } from 'echarts'

ECHARTS.use([
  SVGRenderer,
  LineChart,
  GridComponent,
  PieChart,
  LegendComponent,
  BarChart,
])

const DEFAULT_INIT: EChartsInitOpts = {
  width: 500,
  height: 500,
  renderer: 'svg',
}

interface InitProps {
  chartRef: any
  options: EChartsOption
  theme?: 'light' | 'dark'
}

export const useChartInit = ({ chartRef, options, theme }: InitProps) => {
  let chart: any

  if (chartRef.current) {
    chart = ECHARTS.init(chartRef.current, theme || 'light', {
      ...DEFAULT_INIT,
    })
    chart.setOption(options)
  }

  return { chart }
}
