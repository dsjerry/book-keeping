import { useState } from 'react'
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, TextInput, Button, useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

import { useAppSettingsStore } from '~store/settingStore'
import { useKeepingStore } from '~store/keepingStore'
import { withAlpha } from '~utils'

const BudgetSettings: React.FC = () => {
  const theme = useTheme()
  const navigation = useNavigation()
  const { monthlyBudget, setMonthlyBudget } = useAppSettingsStore()
  const { output } = useKeepingStore()
  const [editValue, setEditValue] = useState(monthlyBudget > 0 ? String(monthlyBudget) : '')
  const [isEditing, setIsEditing] = useState(monthlyBudget === 0)

  const used = output
  const budget = monthlyBudget
  const remaining = Math.max(0, budget - used)
  const percent = budget > 0 ? Math.min((used / budget) * 100, 100) : 0
  const isOver = used > budget && budget > 0

  const handleSave = () => {
    const val = parseFloat(editValue) || 0
    setMonthlyBudget(val)
    setIsEditing(false)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[style.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={style.content} showsVerticalScrollIndicator={false}>
          {/* 预算概览卡片 */}
          <View style={[style.card, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[style.cardTitle, { color: theme.colors.onSurfaceVariant }]}>月度预算</Text>
            {budget > 0 ? (
              <>
                <View style={style.amountRow}>
                  <Text style={[style.amountNum, { color: theme.colors.primary }]}>¥{budget.toLocaleString()}</Text>
                  <Text style={[style.amountUnit, { color: theme.colors.onSurfaceVariant }]}>/月</Text>
                </View>
                {/* 进度条 */}
                <View style={[style.progressTrack, { backgroundColor: withAlpha(theme.colors.primary, 0.12) }]}>
                  <View
                    style={[
                      style.progressBar,
                      {
                        width: `${percent}%`,
                        backgroundColor: isOver ? theme.colors.error : theme.colors.primary,
                      },
                    ]}
                  />
                </View>
                <View style={style.progressInfo}>
                  <Text style={[style.progressText, { color: theme.colors.onSurfaceVariant }]}>
                    已用 ¥{used.toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      style.progressText,
                      { color: isOver ? theme.colors.error : theme.colors.onSurfaceVariant },
                    ]}>
                    {isOver ? `超支 ¥${(used - budget).toLocaleString()}` : `剩余 ¥${remaining.toLocaleString()}`}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={[style.emptyText, { color: theme.colors.onSurfaceVariant }]}>尚未设置月度预算</Text>
            )}
          </View>

          {/* 设置预算 */}
          <View style={[style.card, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[style.cardTitle, { color: theme.colors.onSurfaceVariant }]}>
              {budget > 0 ? '修改预算' : '设置预算'}
            </Text>
            {isEditing ? (
              <View style={style.editRow}>
                <TextInput
                  mode="outlined"
                  value={editValue}
                  onChangeText={setEditValue}
                  keyboardType="numeric"
                  placeholder="输入月度预算金额"
                  style={style.input}
                  outlineStyle={{ borderRadius: 12 }}
                  left={<TextInput.Affix text="¥" />}
                />
                <Button mode="contained" onPress={handleSave} style={style.saveBtn}>
                  保存
                </Button>
              </View>
            ) : (
              <Button mode="outlined" onPress={() => setIsEditing(true)} style={style.editBtn}>
                {budget > 0 ? '修改预算' : '去设置'}
              </Button>
            )}
          </View>

          {/* 说明 */}
          <Text style={[style.hint, { color: theme.colors.onSurfaceVariant }]}>
            设置月度预算后，首页会显示预算使用进度
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

const style = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  amountNum: { fontSize: 32, fontWeight: 'bold' },
  amountUnit: { fontSize: 14, marginLeft: 4 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: { height: 8, borderRadius: 4 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  editRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, borderRadius: 12 },
  saveBtn: { borderRadius: 12, height: 48 },
  editBtn: { borderRadius: 12 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 8 },
})

export default BudgetSettings
