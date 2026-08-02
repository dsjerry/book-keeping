import React from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import Svg, { Defs, LinearGradient, Stop, Path, Rect, Circle, Polyline, G } from 'react-native-svg'

interface DrawerIconProps {
  size?: number
}

/**
 * 抽屉导航图标统一容器，尺寸与 paper 的 List.Icon 一致（40x40 + margin 8），
 * 保证与 List.Item 标题对齐。
 */
const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ margin: 8, height: 8, width: 8, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
)

/** 首页：暖橙渐变屋顶 + 青蓝渐变墙体 + 淡黄门 */
export const HomeColorIcon: React.FC<DrawerIconProps> = ({ size = 24 }) => (
  <IconWrapper>
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="homeRoof" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFB74D" />
          <Stop offset="1" stopColor="#F4511E" />
        </LinearGradient>
        <LinearGradient id="homeBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4DD0E1" />
          <Stop offset="1" stopColor="#1E88E5" />
        </LinearGradient>
      </Defs>
      <Path d="M5.4 9.2 V21 H18.6 V9.2 Z" fill="url(#homeBody)" />
      <Path d="M12 2.2 L21.6 9.2 H2.4 Z" fill="url(#homeRoof)" />
      <Path d="M10.1 21 V14.6 H13.9 V21 Z" fill="#FFF9C4" />
      <Circle cx="13.3" cy="17.8" r="0.55" fill="#8D6E63" />
    </Svg>
  </IconWrapper>
)

/** 分析：三根不同渐变的柱子（蓝/绿/紫）+ 金色趋势折线 */
export const AnalyzeColorIcon: React.FC<DrawerIconProps> = ({ size = 24 }) => (
  <IconWrapper>
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="anBar1" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#1E88E5" />
          <Stop offset="1" stopColor="#64B5F6" />
        </LinearGradient>
        <LinearGradient id="anBar2" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#43A047" />
          <Stop offset="1" stopColor="#81C784" />
        </LinearGradient>
        <LinearGradient id="anBar3" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#8E24AA" />
          <Stop offset="1" stopColor="#BA68C8" />
        </LinearGradient>
      </Defs>
      <Polyline
        points="5.6,10 12,4.5 18.4,13"
        stroke="#FFB300"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Rect x="3.5" y="10" width="4.2" height="10" rx="1.2" fill="url(#anBar1)" />
      <Rect x="9.9" y="4.5" width="4.2" height="15.5" rx="1.2" fill="url(#anBar2)" />
      <Rect x="16.3" y="13" width="4.2" height="7" rx="1.2" fill="url(#anBar3)" />
      <Circle cx="5.6" cy="10" r="1.6" fill="#FFB300" />
      <Circle cx="12" cy="4.5" r="1.6" fill="#FFB300" />
      <Circle cx="18.4" cy="13" r="1.6" fill="#FFB300" />
    </Svg>
  </IconWrapper>
)

/** 设置：金色齿 + 蓝色渐变轮体 + 中心孔透出背景色 */
export const SettingsColorIcon: React.FC<DrawerIconProps> = ({ size = 24 }) => {
  const theme = useTheme()
  return (
    <IconWrapper>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="gearBody" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#64B5F6" />
            <Stop offset="1" stopColor="#1E88E5" />
          </LinearGradient>
          <LinearGradient id="gearTeeth" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFD54F" />
            <Stop offset="1" stopColor="#FF9800" />
          </LinearGradient>
        </Defs>
        {Array.from({ length: 8 }).map((_, i) => (
          <G key={i} rotation={i * 45} origin="12, 12">
            <Rect x="10.6" y="0.9" width="2.8" height="4.6" rx="1.2" fill="url(#gearTeeth)" />
          </G>
        ))}
        <Circle cx="12" cy="12" r="8.2" fill="url(#gearBody)" />
        <Circle cx="12" cy="12" r="3.4" fill={theme.colors.background} />
      </Svg>
    </IconWrapper>
  )
}
