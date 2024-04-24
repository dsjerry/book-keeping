import React from 'react'
import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TextInput, Chip, Button } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

import { CountTypeList } from 'consts/Data'
import { useAdding } from './hooks/useAdding'
import OutTypePane from './components/OutTypePane'
import CountTypePicker from './components/CountTypePicker'

const Adding = () => {
  const [tips, setTips] = useState('')

  const {
    action,
    outTypes,
    chipS,
    setChipS,
    count,
    setCount,
    countTypeIndex,
    setCountTypeIndex,
  } = useAdding()

  const navigation = useNavigation()

  const onAddPress = () => {
    if (count.trim() === '') {
      setTimeout(() => setTips(''), 1500)
      return setTips('请输入金额')
    }

    action.add({
      id: Date.now().toString(),
      count: Number(count),
      type: chipS === 'in' ? 'in' : 'out',
      countType: CountTypeList[countTypeIndex],
      tags: outTypes.filter(chip => chip.isChecked),
      isChecked: false,
      date: Date.now(),
    })

    navigation.goBack()
  }

  return (
    <View style={style.container}>
      <Text>记一笔</Text>
      <View style={style.count}>
        <TextInput
          label="金额"
          value={count}
          onChangeText={text => setCount(text)}
          keyboardType="numeric"
          style={{ flex: 3 }}
          right={
            tips && (
              <TextInput.Icon icon="alert-circle-outline" color="#6750a4" />
            )
          }
        />
        <CountTypePicker />
      </View>
      <View style={style.countType}>
        <Chip selected={chipS === 'in'} onPress={() => setChipS('in')}>
          收入
        </Chip>
        <Chip
          selected={chipS === 'out'}
          style={{ marginLeft: 5 }}
          onPress={() => setChipS('out')}>
          支出
        </Chip>
      </View>
      {chipS === 'out' && <OutTypePane />}
      <TextInput
        label="备注"
        style={{ width: '100%', height: 100, marginTop: 20 }}
        mode="outlined"
        multiline
      />
      <Button mode="outlined" style={style.addBtn} onPress={onAddPress}>
        提交
      </Button>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  count: {
    width: '100%',
    height: 50,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countType: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  addBtn: {
    width: '100%',
    marginTop: 20,
  },
})

export default Adding
