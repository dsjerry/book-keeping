import { Pressable, Text, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { CountTypeList } from '~consts/Data'

/**
 * 币种选择器（人民币/港币/澳元）。
 * 选项只有 3 个，用横向胶囊按钮组替代滚轮（react-native-wheely 内部是 FlatList，
 * 嵌套在表单的 ScrollView 里会触发 VirtualizedList 同方向嵌套警告）。
 */
export function CountTypePicker({ index, setIndex }: Props) {
  const theme = useTheme()
  return (
    <View style={{ flexDirection: 'row', marginLeft: 10 }}>
      {CountTypeList.map((label, i) => {
        const active = i === index
        return (
          <Pressable
            key={label}
            onPress={() => setIndex(i)}
            style={[
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 12,
                marginRight: 8,
              },
              active ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surfaceVariant },
            ]}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
              }}>
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

interface Props {
  index: number
  setIndex: (index: number) => void
}
