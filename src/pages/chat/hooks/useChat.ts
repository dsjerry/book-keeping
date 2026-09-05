import { useState, useCallback, useRef, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs'

import type { Message } from '../ChatScreen'
import { Auth } from '~api/auth'
import http from '~utils/http'
import { useAppSettingsStore } from '~store/settingStore'

// 聊天记录持久化存储 key
const CHAT_STORAGE_KEY = '@jkeep/chat_messages'

interface UseChatOptions {
  items: any[]
  output: number
  income: number
  apiKey: string
  model: string
}

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
// 支持视觉输入（图片理解）的模型
const VISION_MODEL = 'deepseek-v4-flash-vision-exp'

// 根据图片文件扩展名推断 MIME 类型，用于构造 data URI
const getImageMimeType = (uri: string): string => {
  const ext = (uri.split('.').pop() || '').toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'heic':
    case 'heif':
      return 'image/heic'
    default:
      return 'image/jpeg'
  }
}

// 将本地图片 URI 读取为 base64 字符串
const readImageAsBase64 = async (uri: string): Promise<string> => {
  const filePath = uri.replace(/^file:\/\//, '')
  return RNFS.readFile(filePath, 'base64')
}

/**
 * 使用 XMLHttpRequest + SSE 流式调用 DeepSeek API。
 * React Native 的 XHR 支持 onprogress 增量读取（readyState=3），
 * 不依赖 Web Streams，可兼容 React Native。
 */
const streamChatRequest = (url: string, token: string, body: any, signal: AbortSignal): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    let fullText = ''
    let responseLength = 0
    let sseBuffer = ''

    const abortHandler = () => xhr.abort()
    signal.addEventListener('abort', abortHandler)

    // 解析 SSE 增量数据，保留跨网络分片的不完整行
    const parseChunk = (raw: string) => {
      sseBuffer += raw
      const lines = sseBuffer.split('\n')
      sseBuffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') continue
        try {
          const json = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }
          const delta = json.choices?.[0]?.delta?.content
          if (delta) fullText += delta
        } catch (e) {
          // 忽略无法解析的 SSE 行
        }
      }
    }

    // 处理增量数据（readyState=3 与 onprogress 双监听，确保流式增量触发）
    const processIncremental = () => {
      const newChunk = xhr.responseText.slice(responseLength)
      responseLength = xhr.responseText.length
      parseChunk(newChunk)
    }

    xhr.onprogress = processIncremental

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 3) {
        // 流式传输中：处理新增部分
        processIncremental()
      } else if (xhr.readyState === 4) {
        signal.removeEventListener('abort', abortHandler)
        if (xhr.status >= 200 && xhr.status < 300) {
          // 处理剩余的尾部数据
          processIncremental()
          if (sseBuffer) parseChunk('\n')
          resolve(fullText)
        } else {
          let message = `API 请求失败 (${xhr.status})`
          try {
            const json = JSON.parse(xhr.responseText)
            // 兼容 DeepSeek 原生错误结构与自建服务端的统一响应包装
            message = json.error?.message || json.message || message
          } catch (e) {}
          reject(Object.assign(new Error(message), { status: xhr.status }))
        }
      }
    }

    xhr.onerror = () => {
      signal.removeEventListener('abort', abortHandler)
      reject(new Error('网络请求失败，请检查网络连接'))
    }

    xhr.send(JSON.stringify(body))
  })
}

const animateText = (
  text: string,
  onUpdate: (value: string) => void,
  signal: AbortSignal,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const characters = Array.from(text)
    const charactersPerSecond = 120
    const startTime = Date.now()
    let index = 0
    let displayed = ''
    let timer: ReturnType<typeof setTimeout> | null = null

    const finish = () => {
      if (timer) clearTimeout(timer)
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }

    const handleAbort = () => {
      if (timer) clearTimeout(timer)
      signal.removeEventListener('abort', handleAbort)
      reject(Object.assign(new Error('生成已停止'), { name: 'AbortError' }))
    }

    const tick = () => {
      if (signal.aborted) {
        handleAbort()
        return
      }
      if (index >= characters.length) {
        finish()
        return
      }
      const elapsed = Date.now() - startTime
      const nextIndex = Math.min(
        characters.length,
        Math.max(index + 1, Math.floor((elapsed * charactersPerSecond) / 1000)),
      )
      displayed = characters.slice(0, nextIndex).join('')
      index = nextIndex
      onUpdate(displayed)
      timer = setTimeout(tick, 16)
    }

    signal.addEventListener('abort', handleAbort)
    tick()
  })
}

export const useChat = ({ items, output, income, apiKey, model }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // 挂载时从本地恢复聊天记录
  useEffect(() => {
    let cancelled = false
    AsyncStorage.getItem(CHAT_STORAGE_KEY)
      .then(data => {
        if (cancelled || !data) return
        try {
          const parsed = JSON.parse(data) as Message[]
          if (Array.isArray(parsed)) {
            setMessages(parsed)
          }
        } catch (e) {
          console.error('解析聊天记录失败:', e)
        }
      })
      .catch(e => console.error('加载聊天记录失败:', e))
    return () => {
      cancelled = true
    }
  }, [])

  // 消息变化时自动保存
  useEffect(() => {
    AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)).catch(e =>
      console.error('保存聊天记录失败:', e),
    )
  }, [messages])

  // 获取记账数据摘要
  const getFinanceSummary = useCallback(() => {
    const recentItems = items.slice(0, 10)
    const tagSummary = recentItems.reduce<Record<string, { count: number; amount: number }>>((acc, item) => {
      item.tags.forEach((tag: any) => {
        if (!acc[tag.name]) {
          acc[tag.name] = { count: 0, amount: 0 }
        }
        acc[tag.name].count += 1
        acc[tag.name].amount += Number(item.count) || 0
      })
      return acc
    }, {})

    const tagDetail = Object.entries(tagSummary)
      .map(([name, data]) => `${name}(${data.count}次, ¥${data.amount.toFixed(2)})`)
      .join('、')

    return `## 用户记账数据摘要
- 总支出：¥${output.toFixed(2)}
- 总收入：¥${income.toFixed(2)}
- 结余：¥${(income - output).toFixed(2)}（${income > output ? '盈余' : '亏损'}）
- 消费分类：${tagDetail || '暂无数据'}
- 记录总数：${items.length}条`
  }, [items, output, income])

  // 获取系统提示词
  const getSystemPrompt = useCallback(() => {
    const financeSummary = getFinanceSummary()

    let systemPrompt = `你是一个专业的个人记账助手，名为"小助手"。你擅长分析用户的消费数据，提供财务建议，帮助用户更好地管理个人财务。

${financeSummary}

## 你的能力
1. 分析用户的消费习惯和模式
2. 提供节省开支的建议
3. 回答财务相关问题
4. 帮助用户制定预算计划

## 回答风格
- 使用中文回答
- 保持专业但友好的语气
- 给出具体、可执行的建议
- 如果用户询问消费数据，基于上述摘要进行分析`

    return systemPrompt
  }, [model, getFinanceSummary])

  /**
   * 统一的流式请求入口：登录且启用同步时走服务端 /v1/ai/chat 代理
   * （密钥收归服务端，客户端不再持有/暴露 DeepSeek key）。
   * 服务端未配置 AI（503）且本地有 key 时回退直连，保证功能不中断
   */
  const streamChat = useCallback(
    async (body: any, signal: AbortSignal): Promise<string> => {
      const token = await Auth.getToken()
      const { useOnline } = useAppSettingsStore.getState()
      if (token?.access_token && useOnline) {
        try {
          return await streamChatRequest(`${http.getOrigin()}/v1/ai/chat`, token.access_token, body, signal)
        } catch (error: any) {
          if (apiKey && error?.status === 503 && !signal.aborted) {
            return streamChatRequest(`${DEEPSEEK_BASE_URL}/chat/completions`, apiKey, body, signal)
          }
          throw error
        }
      }
      return streamChatRequest(`${DEEPSEEK_BASE_URL}/chat/completions`, apiKey, body, signal)
    },
    [apiKey],
  )

  // 发送消息
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)
      setStreamingText('')

      try {
        // 准备消息列表
        const chatMessages = [
          { role: 'system', content: getSystemPrompt() },
          ...messages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          { role: 'user', content: text },
        ]

        // 发起流式请求
        const controller = new AbortController()
        abortControllerRef.current = controller

        /*
         * 注意：当前实现会等待接口完整返回后，才启动客户端打字机动画。
         * 因此接口请求期间页面不会显示增量文字；请求完成后才开始逐字显示。
         */
        const fullText = await streamChat({ model, messages: chatMessages, stream: true }, controller.signal)
        await animateText(fullText, setStreamingText, controller.signal)

        // 完成时添加完整消息
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullText,
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, assistantMessage])
        setStreamingText('')
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('用户取消了生成')
        } else {
          console.error('聊天出错:', error)
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `抱歉，出现了错误：${error.message || '请稍后再试。'}`,
            timestamp: Date.now(),
          }
          setMessages(prev => [...prev, errorMessage])
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
        setStreamingText('')
      }
    },
    [messages, apiKey, model, isLoading, getSystemPrompt, streamChat],
  )

  // 发送图片消息
  const handleImageSend = useCallback(
    async (text: string, imageUri: string) => {
      if (isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text || '请分析这张图片',
        image: imageUri,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)
      setStreamingText('')

      try {
        // 读取图片为 base64，构造 data URI（参考 DeepSeek Vision API 的 content 数组格式）
        const imageBase64 = await readImageAsBase64(imageUri)
        const imageDataUri = `data:${getImageMimeType(imageUri)};base64,${imageBase64}`

        const chatMessages = [
          { role: 'system', content: getSystemPrompt() },
          ...messages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          {
            role: 'user',
            content: [
              { type: 'text', text: text || '请分析这张图片' },
              { type: 'image_url', image_url: { url: imageDataUri } },
            ],
          },
        ]

        const controller = new AbortController()
        abortControllerRef.current = controller

        // 图片理解使用支持视觉输入的模型
        const fullText = await streamChat({ model: VISION_MODEL, messages: chatMessages, stream: true }, controller.signal)
        await animateText(fullText, setStreamingText, controller.signal)

        // 完成时添加完整消息
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullText,
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, assistantMessage])
        setStreamingText('')
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('用户取消了生成')
        } else {
          console.error('图片聊天出错:', error)
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `抱歉，处理图片时出现了错误：${error.message || '请稍后再试。'}`,
            timestamp: Date.now(),
          }
          setMessages(prev => [...prev, errorMessage])
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
        setStreamingText('')
      }
    },
    [messages, apiKey, isLoading, getSystemPrompt, streamChat],
  )

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    messages,
    input,
    setInput,
    handleSend,
    handleImageSend,
    isLoading,
    stopGeneration,
    streamingText,
  }
}
