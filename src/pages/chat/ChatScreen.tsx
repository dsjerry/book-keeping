import React, { useState, useRef, useCallback, useEffect } from 'react'
import { View, FlatList, StyleSheet, Text, Animated, ScrollView } from 'react-native'
import { useTheme, IconButton, Divider, Chip } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Config from 'react-native-config'

import MessageBubble from './components/MessageBubble'
import ChatInput from './components/ChatInput'
import ModelSelector from './components/ModelSelector'
import { useChat } from './hooks/useChat'
import { useKeepingStore } from '~store/keepingStore'
import { useAppSettingsStore } from '~store/settingStore'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  image?: string
  timestamp: number
}

const ChatScreen: React.FC = () => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const scrollPendingRef = useRef(false)

  const { items, output, income } = useKeepingStore()
  const { deepseekApiKey, deepseekModel } = useAppSettingsStore()

  const [selectedModel, setSelectedModel] = useState(deepseekModel || 'deepseek-v4-flash')

  // 优先用用户自定义配置，fallback 到 .env
  const apiKey = deepseekApiKey || Config.DEEPSEEK_API_KEY || ''

  const { messages, input, setInput, handleSend, handleImageSend, isLoading, stopGeneration, streamingText } = useChat({
    items,
    output,
    income,
    apiKey,
    model: selectedModel,
  })

  // 入场动画
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  const scrollToBottom = useCallback((animated = true) => {
    if (scrollPendingRef.current) return
    scrollPendingRef.current = true
    setTimeout(() => {
      scrollPendingRef.current = false
      flatListRef.current?.scrollToEnd({ animated })
    }, 50)
  }, [])

  useEffect(() => {
    if (streamingText) scrollToBottom()
  }, [streamingText, scrollToBottom])

  const onSend = useCallback(
    (text: string, image?: string) => {
      if (image) {
        handleImageSend(text, image)
      } else {
        handleSend(text)
      }
      scrollToBottom()
    },
    [handleSend, handleImageSend, scrollToBottom],
  )

  const renderWelcomeMessage = () => (
    <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
      <View style={[styles.welcomeBubble, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={[styles.robotAvatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.robotEmoji}>✨</Text>
        </View>
      </View>
      <Text style={[styles.welcomeText, { color: theme.colors.onSurface }]}>你好，我是你的财务助手</Text>
      <Text style={[styles.welcomeSubtext, { color: theme.colors.onSurfaceVariant }]}>
        可以帮你分析消费、制定预算，或回答任何财务问题
      </Text>

      {/* 快捷操作 */}
      <View style={styles.quickActions}>
        <Chip
          icon="chart-bar"
          onPress={() => onSend('帮我分析一下最近的消费情况')}
          style={[styles.quickChip, { backgroundColor: theme.colors.surfaceVariant }]}
          textStyle={{ color: theme.colors.onSurfaceVariant }}>
          消费分析
        </Chip>
        <Chip
          icon="lightbulb-outline"
          onPress={() => onSend('给我一些节省开支的建议')}
          style={[styles.quickChip, { backgroundColor: theme.colors.surfaceVariant }]}
          textStyle={{ color: theme.colors.onSurfaceVariant }}>
          节省建议
        </Chip>
        <Chip
          icon="target"
          onPress={() => onSend('帮我制定一个预算计划')}
          style={[styles.quickChip, { backgroundColor: theme.colors.surfaceVariant }]}
          textStyle={{ color: theme.colors.onSurfaceVariant }}>
          预算规划
        </Chip>
      </View>
    </Animated.View>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => scrollToBottom()}
        ListEmptyComponent={renderWelcomeMessage}
        ListFooterComponent={
          streamingText ? (
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingText,
                timestamp: Date.now(),
              }}
            />
          ) : null
        }
      />

      {/* 底部输入区 */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={onSend}
        isLoading={isLoading}
        onStop={stopGeneration}
        selectedModel={selectedModel}
        style={{ paddingBottom: insets.bottom }}
      />

      {/* 底部提示 */}
      {messages.length > 0 && (
        <View style={[styles.footerHint, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.footerHintText, { color: theme.colors.onSurfaceVariant }]}>
            内容由AI生成，请仔细甄别
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  welcomeBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  robotAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotEmoji: {
    fontSize: 32,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  quickChip: {
    marginBottom: 8,
  },
  footerHint: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerHintText: {
    fontSize: 12,
  },
})

export default ChatScreen
