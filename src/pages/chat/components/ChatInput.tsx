import React, { useState, useCallback } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Keyboard } from 'react-native'
import { useTheme, Icon } from 'react-native-paper'
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'
import SegmentedControl from '~components/SegmentedControl'

interface ChatInputProps {
  input: string
  setInput: (text: string) => void
  onSend: (text: string, image?: string) => void
  isLoading: boolean
  onStop: () => void
  selectedModel: string
  style?: any
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSend, isLoading, onStop, selectedModel, style }) => {
  const theme = useTheme()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState(0) // 0: flash, 1: pro

  const isFlashModel = selectedModel === 'deepseek-v4-flash'

  const handleSend = useCallback(() => {
    if (input.trim() || selectedImage) {
      onSend(input.trim(), selectedImage || undefined)
      setInput('')
      setSelectedImage(null)
      Keyboard.dismiss()
    }
  }, [input, selectedImage, onSend, setInput])

  const handleImagePick = useCallback(async () => {
    Alert.alert('选择图片', '请选择图片来源', [
      {
        text: '拍照',
        onPress: async () => {
          try {
            const result = await launchCamera({
              mediaType: 'photo',
              quality: 0.8,
              maxWidth: 1024,
              maxHeight: 1024,
            })

            if (result.assets && result.assets[0]?.uri) {
              setSelectedImage(result.assets[0].uri)
            }
          } catch (error) {
            console.error('拍照失败:', error)
          }
        },
      },
      {
        text: '从相册选择',
        onPress: async () => {
          try {
            const result = await launchImageLibrary({
              mediaType: 'photo',
              quality: 0.8,
              maxWidth: 1024,
              maxHeight: 1024,
            })

            if (result.assets && result.assets[0]?.uri) {
              setSelectedImage(result.assets[0].uri)
            }
          } catch (error) {
            console.error('选择图片失败:', error)
          }
        },
      },
      {
        text: '取消',
        style: 'cancel',
      },
    ])
  }, [])

  const removeImage = useCallback(() => {
    setSelectedImage(null)
  }, [])

  const canSend = input.trim() || selectedImage

  return (
    <View style={[styles.container, style]}>
      {/* 图片预览 */}
      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
          <TouchableOpacity
            style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
            onPress={removeImage}>
            <Icon source="close" size={14} color={theme.colors.onError} />
          </TouchableOpacity>
        </View>
      )}

      {/* 输入框容器 */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant },
        ]}>
        {/* 输入框 */}
        <TextInput
          style={[styles.textInput, { color: theme.colors.onSurface }]}
          value={input}
          onChangeText={setInput}
          placeholder="有什么可以帮到你..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
          numberOfLines={3}
          maxLength={2000}
          editable={!isLoading}
        />

        {/* 底部栏：模式切换 + 按钮组 */}
        <View style={styles.bottomBar}>
          <View style={styles.segmentedControlWrapper}>
            <SegmentedControl
              options={['flash', 'pro']}
              activeIndex={inputMode}
              onChange={setInputMode}
              style={{ backgroundColor: 'transparent' }}
            />
          </View>

          {/* 按钮组 */}
          <View style={styles.buttonGroup}>
            {/* 附件按钮 */}
            {isFlashModel && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
                onPress={handleImagePick}>
                <Icon source="plus" size={20} color={theme.colors.onPrimaryContainer} />
              </TouchableOpacity>
            )}

            {/* 发送按钮 */}
            {isLoading ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.errorContainer }]}
                onPress={onStop}>
                <Icon source="stop" size={20} color={theme.colors.onError} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: canSend ? theme.colors.primary : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={handleSend}
                disabled={!canSend}>
                <Icon
                  source="send"
                  size={20}
                  color={canSend ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  imagePreview: {
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 88,
    marginVertical: 8,
    // 阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  segmentedControlWrapper: {
    width: 100,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
    padding: 0,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default ChatInput
