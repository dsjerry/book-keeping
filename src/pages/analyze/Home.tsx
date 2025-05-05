import { useEffect, useState, useRef } from 'react'
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Animated } from 'react-native'
import { Card, Button } from 'react-native-paper'
import { ButtonGroup } from '@rneui/themed'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'
import Config from 'react-native-config'
import { deepseek, createDeepSeek } from '@ai-sdk/deepseek'
import { generateObject } from 'ai'
import { z } from 'zod'

import { useKeepingStore } from '~store/keepingStore'
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
  const [btnIndex, setBtnIndex] = useState(0)
  const [display, setDisplay] = useState({ count: 0 })
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiReasoning, setAiReasoning] = useState('') // 存储AI的推理过程
  const [showReasoning, setShowReasoning] = useState(false) // 控制推理过程的显示/隐藏
  
  // 添加动画值
  const fadeAnim = useRef(new Animated.Value(1)).current

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
      
      // 设置结果
      setAiReasoning(analysisResult.reasoning || '')
      setAiResult(analysisResult.answer)
      
    } catch (error) {
      console.error('AI分析失败:', error)
      setAiResult('分析失败，请稍后再试')
    } finally {
      setAiLoading(false)
    }
  }

  // 切换推理过程的显示/隐藏
  const toggleReasoning = () => {
    setShowReasoning(!showReasoning)
  }

  return (
    <ScrollView
      style={homeStyle.container}
      contentContainerStyle={homeStyle.contentContainer}
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
                backgroundColor: 'transparent',
              }}
            />
          </Card>
          <Animated.View 
            style={[homeStyle.sharepane, { opacity: fadeAnim }]} 
            collapsable={false} 
            ref={shareRef}>
            <Card style={[homeStyle.card, countPaneStyle.container]}>
              <View style={countPaneStyle.count}>
                <Text style={countPaneStyle.countNum}>{display.count}</Text>
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
            <Card style={[homeStyle.card, {marginVertical: 10, padding: 15}]}>
              <Text style={{fontWeight: 'bold', marginBottom: 10, color: _COLORS.main}}>AI分析结果</Text>
              <Text>{aiResult}</Text>
              
              {/* 显示AI推理过程（可折叠） */}
              {aiReasoning ? (
                <View>
                  <TouchableOpacity onPress={toggleReasoning} style={{marginTop: 15, flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontWeight: 'bold', color: '#666', marginRight: 5}}>AI思考过程</Text>
                    <Text style={{color: '#666', fontSize: 12}}>{showReasoning ? '(点击收起)' : '(点击展开)'}</Text>
                  </TouchableOpacity>
                  
                  {showReasoning && (
                    <View style={{marginTop: 5, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 5}}>
                      <Text style={{fontSize: 12, color: '#666'}}>{aiReasoning}</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </Card>
          ) : null}
          
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
    backgroundColor: _COLORS.sub,
    paddingBottom: 20,
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
