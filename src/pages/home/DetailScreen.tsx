import { useState, useEffect, useRef, Fragment } from 'react'
import { View } from 'react-native'
import { Card, Button, Text as PaperTetx } from 'react-native-paper'
import { useRoute, useNavigation } from '@react-navigation/native'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'

import LinearCard from './components/LinearCard'
import { layout } from './style'
import { useKeepingStore } from '~store/keepingStore'

const Detail = () => {
  const [isShowNote, setIsShowNote] = useState(true)
  const [item, setItem] = useState<KeepingItem>(defaultItem)
  const { params }: ScreenParam.Detail = useRoute()
  const { items } = useKeepingStore()
  const navigation = useNavigation()

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
      console.error('捕获失败:', error)
    }
  }

  return (
    <View style={layout.container}>
      {/* 
          捕获 View 组件的时候，需要设置 collapsable 为 false
          https://github.com/gre/react-native-view-shot/issues/7#issuecomment-245302844
      */}
      <View style={layout.sharepane} ref={shareRef} collapsable={false}>
        {/* 展示卡片 */}
        <LinearCard item={item} />
        {/* 展示详细信息 */}
        {/* <View style={[layout.detail, { opacity: isShowNote ? 1 : 0 }]}> */}
        {isShowNote && (
          <View style={[layout.detail]}>
            <Card>
              <Card.Title title="备注" />
              <Card.Content style={{ marginBottom: 10 }}>
                <PaperTetx variant="bodyMedium">{item.note}</PaperTetx>
              </Card.Content>
              <Card.Cover
                style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                source={{
                  uri: item.image ? item.image : 'https://picsum.photos/700',
                }}
              />
            </Card>
          </View>
        )}
      </View>
      {/* 更多操作按钮 */}
      <View style={layout.iconBar}>
        <Button icon={'share'} mode="text" onPress={onShare}>
          {'分享'}
        </Button>
        <Button
          icon={'file-document-edit-outline'}
          mode="text"
          onPress={() => onEdit()}>
          {'修改'}
        </Button>
        <Button
          icon={isShowNote ? 'eye' : 'eye-off'}
          mode="text"
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
  tags: [
    { id: '1', name: '餐饮', alias: 'food', icon: 'home', isChecked: false },
  ],
  isChecked: false,
  note: '这个demo',
} as KeepingItem

export default Detail
