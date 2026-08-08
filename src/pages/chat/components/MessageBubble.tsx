import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, StyleSheet, Pressable, Animated } from 'react-native'
import { useTheme, Icon } from 'react-native-paper'

import { useUserStore } from '~store/userStore'

const appLogo = require('../../../../assets/icon.png')

interface MessageBubbleProps {
  message: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    image?: string
    timestamp: number
  }
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const theme = useTheme()
  const currentUser = useUserStore(state => state.currentUser)
  const [isLiked, setIsLiked] = useState<boolean | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const isUser = message.role === 'user'

  // 入场动画
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(isUser ? 20 : -20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const handleCopy = () => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const renderInlineContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g)

    return parts.map((part, index) => {
      const isBold = /^\*\*.+\*\*$|^__.+__$/.test(part)
      const content = isBold ? part.slice(2, -2) : part

      return (
        <Text key={`${index}-${part}`} style={isBold ? styles.boldText : undefined}>
          {content}
        </Text>
      )
    })
  }

  // 解析消息内容，支持 Markdown 基本语法
  const renderContent = (content: string) => {
    // 简单的 Markdown 解析
    const lines = content.split('\n')
    return lines.map((line, index) => {
      // 标题
      if (line.startsWith('### ')) {
        return (
          <Text key={index} style={[styles.heading3, { color: theme.colors.onSurface }]}>
            {renderInlineContent(line.replace('### ', ''))}
          </Text>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <Text key={index} style={[styles.heading2, { color: theme.colors.onSurface }]}>
            {renderInlineContent(line.replace('## ', ''))}
          </Text>
        )
      }
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={[styles.heading1, { color: theme.colors.onSurface }]}>
            {renderInlineContent(line.replace('# ', ''))}
          </Text>
        )
      }

      // 代码块
      if (line.startsWith('```')) {
        return null // 代码块标记，跳过
      }
      if (line.startsWith('`') && line.endsWith('`')) {
        return (
          <Text key={index} style={[styles.inlineCode, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurface }]}>
            {line.replace(/`/g, '')}
          </Text>
        )
      }

      // 列表项
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <View key={index} style={styles.listItem}>
            <Text style={[styles.listBullet, { color: theme.colors.primary }]}>•</Text>
            <Text style={[styles.listText, { color: theme.colors.onSurface }]}>
              {renderInlineContent(line.replace(/^[-*]\s/, ''))}
            </Text>
          </View>
        )
      }

      // 有序列表
      const orderedMatch = line.match(/^(\d+)\.\s/)
      if (orderedMatch) {
        return (
          <View key={index} style={styles.listItem}>
            <Text style={[styles.listNumber, { color: theme.colors.primary }]}>
              {orderedMatch[1]}.
            </Text>
            <Text style={[styles.listText, { color: theme.colors.onSurface }]}>
              {renderInlineContent(line.replace(/^\d+\.\s/, ''))}
            </Text>
          </View>
        )
      }

      // 空行
      if (line.trim() === '') {
        return <View key={index} style={styles.emptyLine} />
      }

      // 普通文本
      return (
        <Text key={index} style={[styles.paragraph, { color: theme.colors.onSurface }]}>
          {renderInlineContent(line)}
        </Text>
      )
    })
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}>
      {/* AI 使用 App Logo 作为头像 */}
      {!isUser && <Image source={appLogo} style={styles.avatarImage} resizeMode="cover" />}

      <View style={[styles.bubbleContainer, isUser ? styles.userBubble : styles.assistantBubble]}>
        {/* 图片 */}
        {message.image && (
          <Image source={{ uri: message.image }} style={styles.image} resizeMode="cover" />
        )}

        {/* 消息内容 */}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubbleStyle : styles.assistantBubbleStyle,
            {
              backgroundColor: isUser ? theme.colors.primary : theme.colors.surfaceVariant,
            },
          ]}>
          {isUser ? (
            <Text style={[styles.messageText, { color: theme.colors.onPrimary }]}>
              {message.content}
            </Text>
          ) : (
            <View style={styles.contentContainer}>
              {renderContent(message.content)}
            </View>
          )}
        </View>

        {/* 时间戳 */}
        <View style={[styles.timeContainer, isUser ? styles.userTime : styles.assistantTime]}>
          <Text style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>

        {/* 消息操作栏 - 仅助手消息显示 */}
        {!isUser && (
          <View style={styles.actionsContainer}>
            <Pressable
              style={[
                styles.actionButton,
                isLiked === true && { backgroundColor: theme.colors.primaryContainer },
              ]}
              onPress={() => setIsLiked(isLiked === true ? null : true)}>
              <Icon
                source="thumb-up-outline"
                size={16}
                color={isLiked === true ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                isLiked === false && { backgroundColor: theme.colors.errorContainer },
              ]}
              onPress={() => setIsLiked(isLiked === false ? null : false)}>
              <Icon
                source="thumb-down-outline"
                size={16}
                color={isLiked === false ? theme.colors.error : theme.colors.onSurfaceVariant}
              />
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                isCopied && { backgroundColor: theme.colors.tertiaryContainer },
              ]}
              onPress={handleCopy}>
              <Icon
                source={isCopied ? 'check' : 'content-copy'}
                size={16}
                color={isCopied ? theme.colors.tertiary : theme.colors.onSurfaceVariant}
              />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Icon source="refresh" size={16} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </View>
        )}
      </View>

      {/* 用户使用当前用户头像，没有头像时显示用户名首字 */}
      {isUser &&
        (currentUser?.avatar ? (
          <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text style={styles.avatarFallback}>{currentUser?.username?.substring(0, 1).toUpperCase() || '我'}</Text>
          </View>
        ))}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarFallback: {
    fontSize: 14,
    fontWeight: '600',
  },
  bubbleContainer: {
    maxWidth: '80%',
  },
  userBubble: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  assistantBubble: {
    alignItems: 'flex-start',
    marginLeft: 8,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubbleStyle: {
    borderBottomRightRadius: 4,
  },
  assistantBubbleStyle: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
  },
  contentContainer: {
    gap: 4,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 8,
  },
  listBullet: {
    fontSize: 15,
    marginRight: 8,
    lineHeight: 22,
  },
  listNumber: {
    fontSize: 15,
    marginRight: 8,
    lineHeight: 22,
  },
  listText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  inlineCode: {
    fontSize: 13,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  emptyLine: {
    height: 8,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  timeContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  userTime: {
    alignItems: 'flex-end',
  },
  assistantTime: {
    alignItems: 'flex-start',
  },
  time: {
    fontSize: 11,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default MessageBubble
