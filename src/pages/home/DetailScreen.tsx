import { useState } from 'react'
import { View } from 'react-native'
import { Card, Button, Text as PaperTetx } from 'react-native-paper'

import LinearCard from './components/LinearCard'
import { layout } from './style'

const Detail = () => {
  const [isShowNote, setIsShowNote] = useState(true)

  return (
    <View style={layout.container}>
      {/* 展示卡片 */}
      <LinearCard />
      {/* 更多操作按钮 */}
      <View style={layout.iconBar}>
        <Button
          icon={'share'}
          mode="text"
          onPress={() => console.log('Pressed')}>
          {'分享'}
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
          <Card.Content>
            <PaperTetx variant="bodyMedium">Card content</PaperTetx>
          </Card.Content>
          <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
        </Card>
      </View>
    </View>
  )
}

interface Props {
  item: KeepingItem
}

export default Detail
