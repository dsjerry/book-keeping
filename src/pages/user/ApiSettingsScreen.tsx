import { useState } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, TextInput, Button, List, RadioButton, useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

import { useAppSettingsStore } from '~store/settingStore'

const MODELS = [
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', desc: '快速模型，响应快、性价比高，适合日常消费分析' },
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', desc: '专业模型，推理能力强，适合复杂财务分析' },
]

const ApiSettings: React.FC = () => {
  const theme = useTheme()
  const navigation = useNavigation()
  const { deepseekApiKey, deepseekModel, setDeepseekApiKey, setDeepseekModel } = useAppSettingsStore()
  const [keyInput, setKeyInput] = useState(deepseekApiKey)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setDeepseekApiKey(keyInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[style.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={style.content}>
        {/* API Key */}
        <View style={[style.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[style.cardTitle, { color: theme.colors.onSurfaceVariant }]}>DeepSeek API Key</Text>
          <TextInput
            mode="outlined"
            value={keyInput}
            onChangeText={setKeyInput}
            placeholder="输入你的 API Key"
            secureTextEntry
            outlineStyle={{ borderRadius: 12 }}
            style={{ marginTop: 8 }}
            right={saved ? <TextInput.Icon icon="check-circle" color={theme.colors.primary} /> : undefined}
          />
          <Text style={[style.hint, { color: theme.colors.onSurfaceVariant }]}>
            留空则使用默认配置（.env 文件中的 key）
          </Text>
          <Button mode="contained" onPress={handleSave} style={{ marginTop: 12, borderRadius: 12 }}>
            保存
          </Button>
        </View>

        {/* 模型选择 */}
        <View style={[style.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[style.cardTitle, { color: theme.colors.onSurfaceVariant }]}>AI 模型</Text>
          <RadioButton.Group onValueChange={setDeepseekModel} value={deepseekModel}>
            {MODELS.map(m => (
              <List.Item
                key={m.id}
                title={m.name}
                description={m.desc}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
                left={props => <RadioButton {...props} value={m.id} />}
                onPress={() => setDeepseekModel(m.id)}
              />
            ))}
          </RadioButton.Group>
        </View>

        <Text style={[style.hint, { color: theme.colors.onSurfaceVariant }]}>
          更换 API Key 或模型后，AI 分析将使用新配置
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const style = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: '500' },
  hint: { fontSize: 12, marginTop: 8 },
})

export default ApiSettings
