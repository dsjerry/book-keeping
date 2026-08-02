import { useState, useEffect, useRef } from 'react'
import { View, ScrollView, Image, StyleSheet } from 'react-native'
import { Button, Text as PaperText, Icon, useTheme } from 'react-native-paper'
import { useRoute, useNavigation } from '@react-navigation/native'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import LinearCard from './components/LinearCard'
import { layout } from './style'
import { useKeepingStore } from '~store/keepingStore'
import { logging, withAlpha } from '~utils'

const Detail = () => {
  const [isShowNote, setIsShowNote] = useState(true)
  const [item, setItem] = useState<KeepingItem>(defaultItem)
  const { params }: ScreenParam.Detail = useRoute()
  const { items } = useKeepingStore()
  const navigation = useNavigation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const shareRef = useRef<any>(null)

  useEffect(() => {
    const dataFound = items.find(item => item.id === params.id)
    if (dataFound) {
      setItem(prev => ({ ...prev, ...dataFound }))
    }
  }, [params.id])

  const onEdit = () => {
    navigation.navigate('Adding', { item, isEdit: true })
  }
  const onShare = async () => {
    try {
      const uri = await captureRef(shareRef.current, {
        format: 'png',
        quality: 0.8,
      })

      const shareOptions = {
        title: '分享到',
        url: uri,
        failOnCancel: false,
      }

      await Share.open(shareOptions)
    } catch (error) {
      logging.error('[分享] 捕获失败:', error)
    }
  }

  return (
    <View style={[detailStyle.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={detailStyle.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/*
           捕获 View 组件的时候，需要设置 collapsable 为 false
           https://github.com/gre/react-native-view-shot/issues/7#issuecomment-245302844
        */}
        <View style={layout.sharepane} ref={shareRef} collapsable={false}>
          {/* 展示卡片 */}
          <View style={{ width: '94%' }}>
            <LinearCard item={item} />
          </View>
          {/* 展示详细信息 */}
          {isShowNote && (
            <View style={layout.detail}>
              {item.address && (
                <View
                  style={[
                    detailStyle.infoCard,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      shadowColor: theme.colors.shadow,
                    },
                  ]}>
                  <View style={detailStyle.infoCardRow}>
                    <View style={[detailStyle.iconCircle, { backgroundColor: withAlpha(theme.colors.primary, 0.08) }]}>
                      <Icon source="map-marker" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={detailStyle.infoCardBody}>
                      <PaperText variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                        {item.address.name}
                      </PaperText>
                      {item.address.businessarea && (
                        <PaperText variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                          {item.address.businessarea}
                        </PaperText>
                      )}
                    </View>
                  </View>
                </View>
              )}
              {item.note && (
                <View
                  style={[
                    detailStyle.infoCard,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      shadowColor: theme.colors.shadow,
                    },
                  ]}>
                  <View style={detailStyle.infoCardRow}>
                    <View style={[detailStyle.iconCircle, { backgroundColor: withAlpha(theme.colors.primary, 0.08) }]}>
                      <Icon source="text-box-outline" size={18} color={theme.colors.primary} />
                    </View>
                    <PaperText variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                      {'备注'}
                    </PaperText>
                  </View>
                  <View style={[detailStyle.noteDivider, { backgroundColor: theme.colors.outlineVariant }]} />
                  <PaperText
                    variant="bodyMedium"
                    style={[detailStyle.noteText, { color: theme.colors.onSurfaceVariant }]}>
                    {item.note}
                  </PaperText>
                </View>
              )}
              {item.image && (
                <View
                  style={[
                    detailStyle.infoCard,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      shadowColor: theme.colors.shadow,
                    },
                  ]}>
                  <View style={detailStyle.infoCardRow}>
                    <View style={[detailStyle.iconCircle, { backgroundColor: withAlpha(theme.colors.primary, 0.08) }]}>
                      <Icon source="image-outline" size={18} color={theme.colors.primary} />
                    </View>
                    <PaperText variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                      {'图片'}
                    </PaperText>
                  </View>
                  <Image
                    style={detailStyle.infoImage}
                    source={{
                      uri: item.image ? item.image : 'https://picsum.photos/700',
                    }}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      {/* 更多操作按钮 */}
      <View
        style={[
          layout.iconBar,
          {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.colors.outlineVariant,
            paddingBottom: insets.bottom + 12,
            backgroundColor: theme.colors.elevation.level2,
          },
        ]}>
        <Button
          icon={'share-variant'}
          mode="contained-tonal"
          style={detailStyle.iconBtn}
          contentStyle={detailStyle.iconBtnContent}
          labelStyle={detailStyle.iconBtnLabel}
          onPress={onShare}>
          {'分享'}
        </Button>
        <Button
          icon={'file-document-edit-outline'}
          mode="contained-tonal"
          style={detailStyle.iconBtn}
          contentStyle={detailStyle.iconBtnContent}
          labelStyle={detailStyle.iconBtnLabel}
          onPress={() => onEdit()}>
          {'修改'}
        </Button>
        <Button
          icon={isShowNote ? 'eye' : 'eye-off'}
          mode="contained-tonal"
          style={detailStyle.iconBtn}
          contentStyle={detailStyle.iconBtnContent}
          labelStyle={detailStyle.iconBtnLabel}
          onPress={() => setIsShowNote(!isShowNote)}>
          {'备注'}
        </Button>
      </View>
    </View>
  )
}

const defaultItem = {
  id: Date.now().toLocaleString(),
  count: '10',
  type: 'out',
  countType: '人民币',
  tags: [{ id: '1', name: '餐饮', alias: 'food', icon: 'home', isChecked: false }],
  isChecked: false,
  note: '这个demo',
} as KeepingItem

const detailStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  infoCard: {
    marginBottom: 14,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  infoCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCardBody: {
    flex: 1,
  },
  noteDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
    marginBottom: 10,
  },
  noteText: {
    lineHeight: 22,
  },
  infoImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 12,
  },
  iconBtn: {
    flex: 1,
    borderRadius: 12,
  },
  iconBtnContent: {
    paddingVertical: 4,
    height: 44,
  },
  iconBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
})

export default Detail
