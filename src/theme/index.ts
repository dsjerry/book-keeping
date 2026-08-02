import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper'

/**
 * 自定义主题：紫色系 primary + 青绿/薄荷 tertiary 点缀色
 *
 * 设计意图：
 * - primary 保持 MD3 紫色（#6750A4 / #D0BCFF）—— 主交互、导航、按钮主操作
 * - tertiary 设为青绿/薄荷（MD3 teal 标准配色）—— 图表柱形、次要图标、头像占位等点缀元素
 * - 除 tertiary 系外，不修改其他颜色
 */
export const LightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    tertiary: '#00696D',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#9CF1F0',
    onTertiaryContainer: '#002020',
  },
}

export const DarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    tertiary: '#4DDADA',
    onTertiary: '#003737',
    tertiaryContainer: '#005050',
    onTertiaryContainer: '#9CF1F0',
  },
}
