import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { Card, Button, Divider, List, useTheme } from 'react-native-paper'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'
import Config from 'react-native-config'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { generateObject } from 'ai'
import { z } from 'zod'
import { format } from 'date-fns'

import { useKeepingStore } from '~store/keepingStore'
import { useAnalyzeStore, AnalysisResult } from '~store/analyzeStore'
import { GetData, TimeFilter } from '~utils'
import SegmentedControl from '~components/SegmentedControl'
import { PiePane, LocationBarChart, CountBarChart, LoadingIndicator } from './components'
import { useHeaderContext } from '../../contexts/HeaderContext'

// 初始化DeepSeek客户端（优先用用户自定义配置，fallback 到 .env）
const deepseekClient = (() => {
  const settings = require('~store/settingStore').useAppSettingsStore.getState()
  return createDeepSeek({ apiKey: settings.deepseekApiKey || Config.DEEPSEEK_API_KEY || '' })
})()

// 定义AI分析结果的数据模式
const AnalysisResultSchema = z.object({
  reasoning: z.string().optional(),
  answer: z.string(),
})

const Home = () => {
  const theme = useTheme() // 获取当前主题
  const [btnIndex, setBtnIndex] = useState(0)
  const {
    state: { timeFilter },
  } = useHeaderContext()
  const [display, setDisplay] = useState({ count: 0 })
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiReasoning, setAiReasoning] = useState('') // 存储AI的推理过程
  const [showReasoning, setShowReasoning] = useState(false) // 控制推理过程的显示/隐藏
  const [showHistory, setShowHistory] = useState(false) // 控制历史分析记录的显示/隐藏

  // 动画值已移除：Animated.View 的 opacity/transform 动画会导致卡片阴影异常

  const { items, output, income, setCounting } = useKeepingStore()
  const { results, addResult, getResult } = useAnalyzeStore()

  const shareRef = useRef<any>(null)

  const chartData = useMemo(() => {
    const gd = new GetData(items, timeFilter)
    return gd
  }, [items, timeFilter])

  // 支出统计数据（消费类型图、AI 分析用）；金额占比图需跟随 支出/收入 切换
  const { tagCounts, aliasCountArray } = useMemo(() => chartData.getTags(false), [chartData])
  const tagsIncome = useMemo(() => chartData.getTags(true), [chartData])
  const data = useMemo(() => chartData.getDate(), [chartData])
  // 地点分布数据也必须 useMemo 缓存稳定引用——直接调用会在每次渲染时生成新数组，
  // 导致图表组件 useEffect 依赖 data 变化而销毁重建（echarts.init 开销大，是卡顿根因）
  const locationData = useMemo(() => chartData.getLocation(false), [chartData])
  // 金额占比：支出 tab 用支出数据，收入 tab 用收入数据
  const amountPieData = useMemo(
    () => (btnIndex === 0 ? aliasCountArray : tagsIncome.aliasCountArray),
    [btnIndex, aliasCountArray, tagsIncome],
  )

  useEffect(() => {
    setCounting()
    setDisplay({ count: output })

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [output, income])

  const onCountTypePress = useCallback((index: number) => {
    if (index === btnIndex) return
    setBtnIndex(index)
    setDisplay({ count: index === 0 ? output : income })
  }, [btnIndex, output, income])

  const onShare = useCallback(async () => {
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
  }, [shareRef])

  const aiAnalysis = useCallback(async () => {
    try {
      setAiLoading(true)
      setAiResult('')
      setAiReasoning('')
      setShowReasoning(false) // 重置折叠状态
      setShowHistory(false) // 关闭历史记录面板

      // 最近 10 条带备注的记录，供 AI 结合具体消费场景分析
      const recentNotes = items
        .filter(i => i.note)
        .sort((a, b) => b.date - a.date)
        .slice(0, 10)
        .map(i => `${i.type === 'in' ? '收入' : '支出'} ${i.count}${i.countType || ''} - ${i.note}`)
        .join('\n')

      // 构建提示词
      const tagDetail = (tagCounts as any[]).map((t: any) => `${t.name}(${t.value}次)`).join('、')
      const amountDetail = (aliasCountArray as any[]).map((t: any) => `${t.name}(¥${t.value})`).join('、')
      const recentContext = recentNotes ? `\n近期消费场景备注（可用于理解消费动机）：\n${recentNotes}` : ''

      const prompt = `你是一位专业的个人理财分析师，请基于以下真实消费数据为用户做一份简洁实用的消费分析报告。

## 消费数据概览
- 总支出：¥${output.toLocaleString()}
- 总收入：¥${income.toLocaleString()}
- 结余：¥${(income - output).toLocaleString()}（${income > output ? '盈余' : '亏损'}）
- 消费次数：${tagCounts.reduce((s: number, t: any) => s + t.value, 0)}笔
- 消费分类：${tagDetail}
- 各分类金额：${amountDetail}
- 消费时间分布：${JSON.stringify(data)}
${recentContext}

## 要求
请从以下几个维度分析，给出简短、可执行的建议：
1. **消费结构**：哪些类别支出最多？是否合理？
2. **收支平衡**：收入与支出的比例关系，结余情况
3. **消费习惯**：从时间分布和备注中发现的消费模式
4. **改进建议**：2-3条具体可操作的节省建议（不要空泛的鸡汤）`

      // 使用AI SDK的generateObject函数调用模型，获取结构化数据
      const settings = require('~store/settingStore').useAppSettingsStore.getState()
      const { object: analysisResult } = await generateObject({
        model: deepseekClient(settings.deepseekModel || 'deepseek-v4-flash'), // 使用DeepSeek模型
        schema: AnalysisResultSchema, // 使用Zod模式定义结构
        prompt: prompt,
        temperature: 0.2, // 降低随机性，使回答更加确定
        maxTokens: 1000, // 增加token限制以容纳推理过程
        system:
          '你是一位资深个人财务分析师，擅长从消费数据中识别消费模式和优化机会。请使用中文输出，风格简洁专业，避免空泛建议。请直接返回JSON对象，包含reasoning（思考过程）和answer（分析报告）字段，不要使用thinking或<answer>等标签。',
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
          timeDistribution: data,
        },
        result: analysisResult.answer,
        reasoning: analysisResult.reasoning,
      })
    } catch (error) {
      console.error('AI分析出错:', error)
      setAiResult('分析过程中出现错误，请稍后再试。')
    } finally {
      setAiLoading(false)
    }
  }, [items, output, income, tagCounts, aliasCountArray, data, addResult])

  // 切换推理过程的显示/隐藏
  const toggleReasoning = useCallback(() => {
    setShowReasoning(prev => !prev)
  }, [])

  // 切换历史记录的显示/隐藏
  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev)
  }, [])

  // 加载历史分析结果
  const loadHistoryResult = useCallback((item: AnalysisResult) => {
    setAiResult(item.result)
    setAiReasoning(item.reasoning || '')
    setShowReasoning(false)
    setShowHistory(false) // 关闭历史面板
  }, [])

  // 格式化时间戳为可读日期
  const formatDate = useCallback((timestamp: number) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm')
  }, [])

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
            <SegmentedControl
              options={['支出', '收入']}
              activeIndex={btnIndex}
              onChange={onCountTypePress}
              style={{ marginHorizontal: 10, marginVertical: 5 }}
            />
          </Card>
          <View style={homeStyle.sharepane} collapsable={false} ref={shareRef}>
            <Card style={[homeStyle.card, countPaneStyle.container]}>
              <View style={countPaneStyle.count}>
                <Text style={[countPaneStyle.countNum, { color: theme.colors.primary }]}>{display.count}</Text>
                <Text style={[countPaneStyle.unitText, { color: theme.colors.primary }]}>{'  '}元</Text>
              </View>
            </Card>
            {/* 各个图表 */}
            {btnIndex === 0 && <PiePane data={tagCounts} units="次" title="消费类型" />}
            <PiePane data={amountPieData} units="元" title="金额占比" />
            {/* 消费地点水平柱状图 */}
            {btnIndex === 0 && <LocationBarChart data={locationData} units="元" title="消费地点" />}
            {btnIndex === 0 && <CountBarChart data={data} title="消费时间" />}
          </View>

          {/* AI分析结果 */}
          {aiResult ? (
            <Card style={[homeStyle.card, aiStyles.resultCard]}>
              <Text style={[aiStyles.resultTitle, { color: theme.colors.primary }]}>AI分析结果</Text>
              <Text style={{ color: theme.colors.onSurface }}>{aiResult}</Text>

              {/* 显示AI推理过程（可折叠） */}
              {aiReasoning ? (
                <View>
                  <TouchableOpacity onPress={toggleReasoning} style={aiStyles.toggleRow}>
                    <Text style={[aiStyles.toggleLabel, { color: theme.colors.outline }]}>AI思考过程</Text>
                    <Text style={[aiStyles.toggleHint, { color: theme.colors.outline }]}>
                      {showReasoning ? '(点击收起)' : '(点击展开)'}
                    </Text>
                  </TouchableOpacity>

                  {showReasoning && (
                    <View style={[aiStyles.reasoningBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text style={[aiStyles.reasoningText, { color: theme.colors.onSurfaceVariant }]}>
                        {aiReasoning}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
            </Card>
          ) : null}

          {/* AI分析历史记录 */}
          {results.length > 0 && (
            <Card style={[homeStyle.card, aiStyles.historyCard]}>
              <Card.Title title="AI分析历史" titleStyle={{ color: theme.colors.onSurface }} />
              <Card.Content>
                <TouchableOpacity onPress={toggleHistory} style={aiStyles.toggleRow}>
                  <Text style={[aiStyles.toggleLabel, { color: theme.colors.outline }]}>历史记录</Text>
                  <Text style={[aiStyles.toggleHint, { color: theme.colors.outline }]}>
                    {showHistory ? '(点击收起)' : `(点击展开, ${results.length}条)`}
                  </Text>
                </TouchableOpacity>

                {showHistory && (
                  <View style={aiStyles.historyList}>
                    {[...results].reverse().map(item => (
                      <React.Fragment key={item.id}>
                        <List.Item
                          title={formatDate(item.timestamp)}
                          titleStyle={{ color: theme.colors.onSurface }}
                          description={`支出: ${item.data.output}元 | 收入: ${item.data.income}元`}
                          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                          left={props => <List.Icon {...props} icon="history" color={theme.colors.onSurfaceVariant} />}
                          onPress={() => loadHistoryResult(item)}
                          style={aiStyles.historyItem}
                        />
                        {item.id !== results[0].id && (
                          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          <View style={homeStyle.actionRow}>
            <Button icon={'share'} mode="text" textColor={theme.colors.primary} onPress={onShare}>
              {'分享'}
            </Button>
            <Button
              icon={'robot'}
              mode="text"
              textColor={theme.colors.primary}
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
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    marginTop: 20,
    borderRadius: 12,
  },
  sharepane: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
})

const countPaneStyle = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNum: { fontSize: 24, fontWeight: 'bold' },
  unitText: { fontSize: 16 },
})

const aiStyles = StyleSheet.create({
  resultCard: {
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
  },
  toggleRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 13,
  },
  toggleHint: {
    fontSize: 12,
  },
  reasoningBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
  },
  reasoningText: {
    fontSize: 12,
  },
  historyCard: {
    marginVertical: 10,
    borderRadius: 12,
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    paddingVertical: 4,
  },
})

export default Home
