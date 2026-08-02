import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { List, useTheme } from 'react-native-paper'
import { dependencies } from '../../../package.json'

export default function LicensesScreen() {
  const theme = useTheme()

  const depEntries = Object.entries(dependencies as Record<string, string>)

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {/* 应用许可卡 */}
      <View style={[styles.licenseCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.licenseTitle, { color: theme.colors.onSurface }]}>应用许可</Text>
        <Text style={[styles.licenseType, { color: theme.colors.primary }]}>MIT License</Text>
        <Text style={[styles.licenseDesc, { color: theme.colors.onSurfaceVariant }]}>
          本项目基于 MIT 许可证开源，允许自由使用、修改和分发
        </Text>
      </View>

      {/* 开源依赖列表 */}
      <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surfaceVariant }]}>
        <List.Subheader style={{ color: theme.colors.onSurface }}>开源依赖</List.Subheader>
        {depEntries.map(([name, version]) => (
          <List.Item
            key={name}
            title={name}
            titleStyle={{ color: theme.colors.onSurface }}
            right={props => (
              <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>{version}</Text>
            )}
          />
        ))}
      </List.Section>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  licenseCard: {
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  licenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  licenseType: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  licenseDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  listSection: {
    marginTop: 20,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 13,
    alignSelf: 'center',
  },
})
