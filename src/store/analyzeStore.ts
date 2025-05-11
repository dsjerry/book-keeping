import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

// AI分析结果的数据结构
export interface AnalysisResult {
  id: string               // 唯一ID
  timestamp: number        // 分析时间戳
  data: {                  // 分析时的数据快照
    output: number         // 总支出
    income: number         // 总收入
    tagCounts: any         // 消费类型分布
    aliasCountArray: any   // 金额占比
    timeDistribution: any  // 消费时间分布
  }
  result: string           // AI分析结果
  reasoning?: string       // AI推理过程（可选）
}

// 分析结果存储的接口定义
interface AnalyzeSlice {
  results: AnalysisResult[]
  addResult: (result: Omit<AnalysisResult, 'id' | 'timestamp'>) => void
  getResult: (id: string) => AnalysisResult | undefined
  removeResult: (id: string) => void
  clearResults: () => void
}

// 创建分析结果存储的状态管理
const createAnalyzeSlice: StateCreator<AnalyzeSlice, [], [], AnalyzeSlice> = (
  set,
  get
) => ({
  results: [],
  
  // 添加新的分析结果
  addResult: (result) => {
    set(state => {
      const newResult: AnalysisResult = {
        ...result,
        id: Date.now().toString(),
        timestamp: Date.now()
      }
      return { results: [...state.results, newResult] }
    })
  },
  
  // 获取特定ID的分析结果
  getResult: (id) => {
    return get().results.find(item => item.id === id)
  },
  
  // 删除特定ID的分析结果
  removeResult: (id) => {
    set(state => ({
      results: state.results.filter(item => item.id !== id)
    }))
  },
  
  // 清空所有分析结果
  clearResults: () => {
    set({ results: [] })
  }
})

// 导出分析结果存储钩子
export const useAnalyzeStore = create<AnalyzeSlice>()(
  persist(
    (...a) => ({
      ...createAnalyzeSlice(...a)
    }),
    {
      name: 'analyze-results',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ results: state.results }),
    }
  )
)
