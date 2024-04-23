import React from 'react'
import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TextInput, Chip, Button } from 'react-native-paper'

import { OutTypes, CountTypeList } from 'consts/Data'
import { useAdding } from './hooks/useAdding'
import OutTypePane from './OutTypePane'
import CountTypePicker from './CountTypePicker'

const Adding = () => {
  const {
    action,
    outTypePicked,
    chipS,
    setChipS,
    count,
    setCount,
    countTypeIndex,
    setCountTypeIndex,
  } = useAdding()

  const pressChip = (item: OutType) => action.pickOutType(item)

  const onAddPress = () => {
    action.add({
      id: Date.now().toString(),
      count: Number(count),
      type: chipS === 'in' ? 'in' : 'out',
      countType: OutTypes[countTypeIndex].name,
      tags: outTypePicked,
      isChecked: false,
      date: Date.now(),
    })
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
      {chipS === 'out' && <OutTypePane onPress={pressChip} />}
      <TextInput
        label="备注"
        style={{ width: '100%', height: 100, marginTop: 20 }}
        mode="outlined"
        multiline
      />
      <Button mode="outlined" onPress={onAddPress}>
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
})

export default Adding
