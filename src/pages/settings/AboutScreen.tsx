import { View, Text, ScrollView, Linking, StyleSheet } from 'react-native'
import { Avatar, useTheme, List } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import Config from 'react-native-config'

interface AboutItem {
  title: string
  icon: string
  rightValue?: string
  /** 外部链接标识：右侧值以主题色 + 下划线渲染（类似 <a> 标签），暗示可跳转 */
  external?: boolean
  onPress?: () => void
}

export default function AboutScreen() {
  const theme = useTheme()
  const navigation = useNavigation()

  const items: AboutItem[] = [
    {
      title: '源代码',
      icon: 'github',
      rightValue: 'github',
      external: true,
      onPress: () => Linking.openURL('https://github.com/dsjerry/book-keeping'),
    },
    {
      title: '发布页',
      icon: 'web',
      rightValue: 'bk.smalljerry.cn',
      external: true,
      onPress: () => Linking.openURL('https://bk.smalljerry.cn'),
    },
    {
      title: '版本',
      icon: 'tag-outline',
      rightValue: Config.APP_VERSION || '1.0.2',
    },
    {
      title: '权限管理',
      icon: 'shield-account-outline',
      onPress: () => navigation.navigate('PermissionScreen', {}),
    },
    {
      title: '开源许可',
      icon: 'file-certificate-outline',
      onPress: () => navigation.navigate('LicensesScreen', {}),
    },
  ]

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {/* 顶部信息卡 */}
      <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <Avatar.Icon
            icon="book-open-variant"
            size={56}
            color={theme.colors.onPrimaryContainer}
            style={{ backgroundColor: 'transparent' }}
          />
        </View>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>{Config.APP_NAME}</Text>
        <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          一款简洁易用的个人记账应用，支持多币种、统计分析、AI 辅助等功能，让记账变得简单高效。
        </Text>
      </View>

      {/* 列表卡 */}
      <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surfaceVariant }]}>
        {items.map((item, index) => (
          <List.Item
            key={index}
            title={item.title}
            left={props => <List.Icon {...props} icon={item.icon} />}
            right={props =>
              item.rightValue ? (
                <Text
                  style={[
                    styles.rightText,
                    item.external
                      ? { color: theme.colors.primary, textDecorationLine: 'underline' }
                      : { color: theme.colors.onSurfaceVariant },
                  ]}>
                  {item.rightValue}
                </Text>
              ) : (
                <List.Icon {...props} icon="chevron-right" />
              )
            }
            onPress={item.onPress}
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
  infoCard: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  listSection: {
    marginTop: 20,
    borderRadius: 12,
  },
  rightText: {
    fontSize: 14,
    alignSelf: 'center',
  },
})
