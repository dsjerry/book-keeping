import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Button,
} from 'react-native'
import { Checkbox } from 'react-native-paper'

/**
 * Checkbox 长按的时候再显示
 */
const Item = () => {
  return (
    <Pressable
      style={({ pressed }) => ({ ...style.item, opacity: pressed ? 0.5 : 1 })}
      onPress={e => console.log('asd')}>
      <View style={style.itemHeader}>
        <Text style={{ marginLeft: 'auto' }}>2024-01-01</Text>
      </View>
      <View style={style.itemBody}>
        <Checkbox status="unchecked" onPress={e => console.log('asd')} />
        <Text>支出</Text>
        <Text>10元</Text>
      </View>
      <View style={tag.pane}>
        {/* 通过循环来做 */}
        <Text style={tag.item}>标签1</Text>
        <Text style={tag.item}>标签2</Text>
        <Text style={tag.item}>标签3</Text>
      </View>
    </Pressable>
  )
}

const KeepingList = () => {
  return (
    <View style={style.container}>
      <FlatList
        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]}
        renderItem={Item}
      />
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    width: '96%',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 5,
    paddingRight: 10,
    borderWidth: 0.5,
    borderRadius: 5,
  },
  itemHeader: {},
  itemBody: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  itemFooter: {},
})

const tag = StyleSheet.create({
  pane: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginLeft: 10,
  },
  item: {
    marginRight: 5,
  },
})

export default KeepingList
