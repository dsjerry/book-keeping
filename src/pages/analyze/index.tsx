import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import HomeScreen from './Home'
import { AnalyzeProvider } from './contexts/AnalyzeContext'

const AnalyzeStack = createStackNavigator()

const Analyze = () => {
  return (
    <AnalyzeProvider>
      <AnalyzeStack.Navigator>
        <AnalyzeStack.Group screenOptions={{ headerShown: false }}>
          <AnalyzeStack.Screen name="AnalyzeHome" component={HomeScreen} />
        </AnalyzeStack.Group>
      </AnalyzeStack.Navigator>
    </AnalyzeProvider>
  )
}

export default Analyze

/**
 * 按每周/月/年统计支出和收入（柱状）
 * 按照标签统计支出和收入（饼状）
 */
