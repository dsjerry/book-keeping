import { streamText, generateText } from 'ai'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { z } from 'zod'

// Web search tool schema
export const webSearchTool = {
  description: '搜索互联网获取最新信息',
  parameters: z.object({
    query: z.string().describe('搜索关键词'),
  }),
}

interface ChatApiOptions {
  apiKey: string
  model: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string | any[] }>
  signal?: AbortSignal
}

/**
 * 流式聊天 API
 */
export const streamChat = async ({
  apiKey,
  model,
  messages,
  signal,
}: ChatApiOptions) => {
  const deepseek = createDeepSeek({ apiKey })

  const result = streamText({
    model: deepseek(model),
    messages,
    abortSignal: signal,
    // 只有 Flash 模型支持 web_search
    ...(model === 'deepseek-v4-flash' && {
      tools: {
        web_search: webSearchTool,
      },
    }),
  })

  return result
}

/**
 * 非流式聊天 API
 */
export const generateChat = async ({
  apiKey,
  model,
  messages,
}: ChatApiOptions) => {
  const deepseek = createDeepSeek({ apiKey })

  const result = await generateText({
    model: deepseek(model),
    messages,
  })

  return result
}

/**
 * 图片理解 API
 */
export const analyzeImage = async ({
  apiKey,
  model = 'deepseek-v4-flash-vision-exp',
  prompt,
  imageBase64,
}: {
  apiKey: string
  model?: string
  prompt: string
  imageBase64: string
}) => {
  const deepseek = createDeepSeek({ apiKey })

  const result = await generateText({
    model: deepseek(model),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image', image: `data:image/jpeg;base64,${imageBase64}` },
        ],
      },
    ],
  })

  return result.text
}

/**
 * 工具调用处理
 */
export const handleToolCall = async (toolName: string, args: any) => {
  switch (toolName) {
    case 'web_search':
      // 这里可以实现实际的 web search 逻辑
      // 由于 DeepSeek API 会自动处理工具调用，这里只是示例
      return `搜索结果: ${args.query} - 暂无具体搜索结果，请使用其他方式获取信息。`
    default:
      return '未知工具'
  }
}
