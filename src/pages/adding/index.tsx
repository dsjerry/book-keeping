import React from 'react'
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Keyboard } from 'react-native'
import { TextInput, Chip, Button } from 'react-native-paper'
import { useNavigation, useRoute } from '@react-navigation/native'

import { CountTypeList } from '~consts/Data'
import { useAdding } from './hooks/useAdding'
import OutTypePane from './components/OutTypePane'
import CountTypePicker from './components/CountTypePicker'
import ImagePicker from '~components/ImagePicker'

const Adding: React.FC<Props> = ({ route }) => {
  const [tips, setTips] = useState('')
  const [version, setVersion] = useState(0)
  const [keyboardStatus, setKeyboardStatus] = useState<'showed' | 'hidden'>(
    'hidden',
  )
  const {
    action,
    outTypes,
    setOutTypes,
    countTypeIndex,
    setCountTypeIndex,
    form,
    setForm,
  } = useAdding()

  const navigation = useNavigation()
  const { params }: ScreenParam.Adding = useRoute()

  useEffect(() => {
    if (params && params?.isEdit) {
      action.edit({
        ...params.item,
      })
    }
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus('showed')
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus('hidden')
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const handleReset = () => {
    setVersion(version + 1)
  }

  const onAddPress = () => {
    if (form.count === `0`) {
      setTimeout(() => setTips(''), 1500)
      return setTips('请输入金额')
    }
    if (params?.isEdit) {
      action.update({
        ...form,
        countType: CountTypeList[countTypeIndex],
        tags: outTypes.filter(chip => chip.isChecked),
        isChecked: false,
      })
    } else {
      action.add({
        id: Date.now().toString(),
        count: form.count,
        type: form.type,
        countType: CountTypeList[countTypeIndex],
        tags: outTypes.filter(chip => chip.isChecked),
        isChecked: false,
        date: Date.now(),
        note: form.note,
        image: form.image,
      })
    }

    navigation.goBack()
    handleReset()
  }

  const onChipPress = (chip: OutType) => {
    setOutTypes(
      outTypes.map(item => {
        if (item.id === chip.id) {
          return { ...item, isChecked: !item.isChecked }
        }
        return item
      }),
    )
  }

  return (
    <View style={style.container} key={version}>
      <Text>记一笔</Text>
      <View style={style.count}>
        <TextInput
          label="金额"
          value={form.count}
          onChangeText={text => setForm({ ...form, count: text })}
          keyboardType="numeric"
          style={{ flex: 3 }}
          right={
            tips && (
              <TextInput.Icon icon="alert-circle-outline" color="#6750a4" />
            )
          }
        />
        <CountTypePicker index={countTypeIndex} setIndex={setCountTypeIndex} />
      </View>
      <View style={style.countType}>
        <Chip
          selected={form.type === 'in'}
          onPress={() => setForm({ ...form, type: 'in' })}>
          收入
        </Chip>
        <Chip
          selected={form.type === 'out'}
          style={{ marginLeft: 5 }}
          onPress={() => setForm({ ...form, type: 'out' })}>
          支出
        </Chip>
      </View>
      {form.type === 'out' && (
        <OutTypePane outTypes={outTypes} onChipPress={onChipPress} />
      )}
      <TextInput
        label="备注"
        style={{ width: '100%', height: 100, marginTop: 20 }}
        mode="outlined"
        multiline
        value={form.note}
        onChangeText={text => setForm({ ...form, note: text })}
      />
      <ImagePicker
        uploaded={assets => setForm({ ...form, image: assets })}
        isShow={keyboardStatus !== 'showed'}
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

interface Props {
  route?: ScreenParam.Adding
}

export default Adding
