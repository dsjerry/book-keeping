import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Animated } from 'react-native'
import { Card, Button, Divider, List, useTheme } from 'react-native-paper'
import { ButtonGroup } from '@rneui/themed'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'
import Config from 'react-native-config'
import { deepseek, createDeepSeek } from '@ai-sdk/deepseek'
import { generateObject } from 'ai'
import { z } from 'zod'
import { format } from 'date-fns'

import { useKeepingStore } from '~store/keepingStore'
import { useAnalyzeStore, AnalysisResult } from '~store/analyzeStore'
import { GetData } from '~utils'
import { _COLORS } from '~consts/Colors'
import { PiePane, CountBarChart, LoadingIndicator } from './components'

// 初始化DeepSeek客户端
const deepseekClient = createDeepSeek({
  apiKey: Config.DEEPSEEK_API_KEY || 'your-key'
})

// 定义AI分析结果的数据模式
const AnalysisResultSchema = z.object({
  reasoning: z.string().optional(),
  answer: z.string()
})

const Home = () => {
  const theme = useTheme() // 获取当前主题
  const [btnIndex, setBtnIndex] = useState(0)
  const [display, setDisplay] = useState({ count: 0 })
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiReasoning, setAiReasoning] = useState('') // 存储AI的推理过程
  const [showReasoning, setShowReasoning] = useState(false) // 控制推理过程的显示/隐藏
  const [showHistory, setShowHistory] = useState(false) // 控制历史分析记录的显示/隐藏

  // 添加动画值
  const fadeAnim = useRef(new Animated.Value(1)).current

  const { items, output, income, setCounting } = useKeepingStore()
  const { results, addResult, getResult } = useAnalyzeStore() // 使用分析结果存储

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
    // 先淡出
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setBtnIndex(index)
      if (index === 0) {
        setDisplay({ count: output })
      } else {
        setDisplay({ count: income })
      }

      // 然后淡入
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start()
    })
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

  const aiAnalysis = async () => {
    try {
      setAiLoading(true)
      setAiResult('')
      setAiReasoning('')
      setShowReasoning(false) // 重置折叠状态
      setShowHistory(false) // 关闭历史记录面板

      // 构建提示词
      const prompt = `请用中文分析以下消费数据并给出建议。

消费数据：
- 总支出：${output}元
- 总收入：${income}元
- 消费类型分布：${JSON.stringify(tagCounts)}
- 金额占比：${JSON.stringify(aliasCountArray)}
- 消费时间分布：${JSON.stringify(data)}

请分析这些数据，找出消费模式，并给出合理的理财建议。`

      // 使用AI SDK的generateObject函数调用模型，获取结构化数据
      const { object: analysisResult } = await generateObject({
        model: deepseekClient('deepseek-chat'), // 使用DeepSeek模型
        schema: AnalysisResultSchema, // 使用Zod模式定义结构
        prompt: prompt,
        temperature: 0.2, // 降低随机性，使回答更加确定
        maxTokens: 1000, // 增加token限制以容纳推理过程
        system: "你是一个专业的财务分析师，擅长分析消费数据并给出合理的理财建议。请使用中文回答。请直接返回一个包含reasoning和answer字段的JSON对象，其中reasoning是你的思考过程，answer是你的最终建议。不要在回答中使用<think>或<answer>等标签。"
      })

      // 设置结果到状态中
      setAiResult(analysisResult.answer)
      if (analysisResult.reasoning) {
        setAiReasoning(analysisResult.reasoning)
      }

      // 保存分析结果到持久化存储
      addResult({
        data: {
          output,
          income,
          tagCounts,
          aliasCountArray,
          timeDistribution: data
        },
        result: analysisResult.answer,
        reasoning: analysisResult.reasoning
      })
    } catch (error) {
      console.error('AI分析出错:', error)
      setAiResult('分析过程中出现错误，请稍后再试。')
    } finally {
      setAiLoading(false)
    }
  }

  // 切换推理过程的显示/隐藏
  const toggleReasoning = () => {
    setShowReasoning(!showReasoning)
  }

  // 切换历史记录的显示/隐藏
  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  // 加载历史分析结果
  const loadHistoryResult = (item: AnalysisResult) => {
    setAiResult(item.result)
    setAiReasoning(item.reasoning || '')
    setShowReasoning(false)
    setShowHistory(false) // 关闭历史面板
  }

  // 格式化时间戳为可读日期
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm')
  }

  return (
    <ScrollView
      style={homeStyle.container}
      contentContainerStyle={[homeStyle.contentContainer, { backgroundColor: theme.colors.elevation.level5 }]}
      centerContent
      snapToAlignment="start">
      <LoadingIndicator animating={loading || aiLoading} text={aiLoading ? 'AI分析中...' : '加载中...'} />
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
                backgroundColor: theme.colors.elevation.level5,
              }}
            />
          </Card>
          <Animated.View
            style={[homeStyle.sharepane, { opacity: fadeAnim }]}
            collapsable={false}
            ref={shareRef}>
            <Card style={[homeStyle.card, countPaneStyle.container]}>
              <View style={countPaneStyle.count}>
                <Text style={[countPaneStyle.countNum, { color: theme.colors.primary }]}>{display.count}</Text>
                <Text>&nbsp;&nbsp;元</Text>
              </View>
            </Card>
            {/* 各个图表 */}
            {btnIndex === 0 && <PiePane data={tagCounts} units="次" title="消费类型" />}
            <PiePane data={aliasCountArray} units="元" title="金额占比" />
            {/* 消费地点分布图表 */}
            {btnIndex === 0 && <PiePane data={chartData.getLocation(false)} units="元" title="消费地点" />}
            {btnIndex === 0 && <CountBarChart data={data} title="消费时间" />}
          </Animated.View>

          {/* AI分析结果 */}
          {aiResult ? (
            <Card style={[homeStyle.card, { marginVertical: 10, padding: 15 }]}>
              <Text style={{ fontWeight: 'bold', marginBottom: 10, color: theme.colors.primary }}>AI分析结果</Text>
              <Text>{aiResult}</Text>

              {/* 显示AI推理过程（可折叠） */}
              {aiReasoning ? (
                <View>
                  <TouchableOpacity onPress={toggleReasoning} style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', color: theme.colors.outline, marginRight: 5 }}>AI思考过程</Text>
                    <Text style={{ color: theme.colors.outline, fontSize: 12 }}>{showReasoning ? '(点击收起)' : '(点击展开)'}</Text>
                  </TouchableOpacity>

                  {showReasoning && (
                    <View style={{ marginTop: 5, padding: 10, backgroundColor: theme.colors.surfaceVariant, borderRadius: 5 }}>
                      <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>{aiReasoning}</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </Card>
          ) : null}

          {/* AI分析历史记录 */}
          {results.length > 0 && (
            <Card style={[homeStyle.card, { marginVertical: 10 }]}>
              <Card.Title title="AI分析历史" />
              <Card.Content>
                <TouchableOpacity onPress={toggleHistory} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: theme.colors.outline, marginRight: 5 }}>历史记录</Text>
                  <Text style={{ color: theme.colors.outline, fontSize: 12 }}>{showHistory ? '(点击收起)' : `(点击展开, ${results.length}条)`}</Text>
                </TouchableOpacity>

                {showHistory && (
                  <View style={{ maxHeight: 300 }}>
                    {[...results].reverse().map(item => (
                      <React.Fragment key={item.id}>
                        <List.Item
                          title={formatDate(item.timestamp)}
                          description={`支出: ${item.data.output}元 | 收入: ${item.data.income}元`}
                          left={props => <List.Icon {...props} icon="history" />}
                          onPress={() => loadHistoryResult(item)}
                          style={{ paddingVertical: 4 }}
                        />
                        {item.id !== results[0].id && <Divider />}
                      </React.Fragment>
                    ))}
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button icon={'share'} mode="text" onPress={onShare}>
              {'分享'}
            </Button>
            <Button
              icon={'robot'}
              mode="text"
              onPress={aiAnalysis}
              loading={aiLoading}
              disabled={aiLoading}>
              {'AI分析'}
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
    paddingBottom: 20,
  },
  card: {
    width: '90%',
    marginTop: 20,
  },
  sharepane: {
    flex: 1,
  },
})

const countPaneStyle = StyleSheet.create({
  container: { width: 'auto', paddingHorizontal: 20, paddingVertical: 20 },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countNum: { fontSize: 24, fontWeight: 'bold' }, // 颜色将通过主题动态设置
})

export default Home
