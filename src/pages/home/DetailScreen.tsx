import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Card, Button, Text as PaperTetx } from 'react-native-paper'
import { useRoute, useNavigation } from '@react-navigation/native'

import LinearCard from './components/LinearCard'
import { layout } from './style'
import { useKeepingStore } from '~hooks/useStore'

const Detail = () => {
  const [isShowNote, setIsShowNote] = useState(true)
  const [item, setItem] = useState<KeepingItem>(defaultItem)
  const { params }: ScreenParam.Detail = useRoute()
  const { items } = useKeepingStore()
  const navigation = useNavigation()

  useEffect(() => {
    const dataFound = items.find(item => item.id === params.id)
    if (dataFound) {
      setItem(prev => ({ ...prev, ...dataFound }))
    }
  }, [params.id])

  const onEdit = () => {
    navigation.navigate('Adding' as never, { item, isEdit: true } as never)
  }
  return (
    <View style={layout.container}>
      {/* 展示卡片 */}
      <LinearCard item={item} />
      {/* 更多操作按钮 */}
      <View style={layout.iconBar}>
        <Button
          icon={'share'}
          mode="text"
          onPress={() => console.log('Pressed')}>
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
      {/* 展示详细信息 */}
      <View style={[layout.detail, { opacity: isShowNote ? 1 : 0 }]}>
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
    </View>
  )
}

const defaultItem = {
  id: Date.now().toLocaleString(),
  count: 10,
  type: 'out',
  countType: '人民币',
  tags: [{ id: '1', name: '餐饮', icon: 'home', isChecked: false }],
  isChecked: false,
  note: '这个demo',
} as KeepingItem

export default Detail
