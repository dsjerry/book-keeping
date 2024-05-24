import React from 'react'
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Keyboard } from 'react-native'
import { TextInput, Chip, Button } from 'react-native-paper'
import { useNavigation, useRoute } from '@react-navigation/native'

import { OutTypes } from '~consts/Data'
import CustomChipPane from '~components/CustomChipPane'
import { CountTypePicker } from './components'
import ImagePicker from '~components/ImagePicker'
import { useHomeStore, useHomeStoreDispatch } from './contexts/HomeContext'
import { useKeepingStore } from '~store/keepingStore'
import { useAppSettingsStore } from '~store/settingStore'
import { useUserStore } from '~store/userStore'

const Adding: React.FC<Props> = ({ route }) => {
  const [tips, setTips] = useState('')
  const [keyboardStatus, setKeyboardStatus] = useState<'showed' | 'hidden'>(
    'hidden',
  )
  const [outTypes, setOutTypes] = useState<OutType[]>([])

  const { add, update } = useKeepingStore()
  const { confirmExitEdit } = useAppSettingsStore()
  const { currentUser } = useUserStore()

  const { form, countTypeIndex, modal } = useHomeStore()
  const dispatch = useHomeStoreDispatch()

  const navigation = useNavigation()
  const { params }: ScreenParam.Adding = useRoute()

  useEffect(() => {
    const _tags = currentUser?.tags || []
    setOutTypes([..._tags, ...OutTypes])

    if (params && params?.isEdit) {
      // TODO
      const item = params.item!
      const newOutTypes = outTypes
      item.tags.forEach(tag => {
        newOutTypes.forEach(item => {
          item.alias === tag.alias ? (item.isChecked = true) : ''
        })
      })
      setOutTypes(newOutTypes)
      dispatch({ type: 'fromEditing', payload: item })
    }
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus('showed')
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus('hidden')
    })

    navigation.addListener('beforeRemove', e => {
      if (confirmExitEdit) {
        e.preventDefault()

        dispatch({
          type: 'modal',
          payload: {
            title: '确定要退出吗？',
            body: '内容将不会被保存',
            isShow: true,
            type: 'exit',
            onAccess: () => {
              dispatch({
                type: 'modal',
                payload: { ...modal, isShow: false, status: false },
              })
              navigation.dispatch(e.data.action)
            },
            onCancel: () => {
              dispatch({
                type: 'modal',
                payload: { ...modal, isShow: false, status: false },
              })
            },
          },
        })
      }
    })

    return () => {
      dispatch({ type: 'emptyForm' })
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const formChanged = (item: Partial<KeepingItem>) => {
    dispatch({ type: 'addForm', payload: { ...form, ...item } })
  }

  const onAddPress = () => {
    if (form.count === `0`) {
      setTimeout(() => setTips(''), 1500)
      return setTips('请输入金额')
    }
    if (params?.isEdit) {
      update(form)
    } else {
      console.log('before:', form)

      add(form)
    }
    navigation.navigate('HomeScreen', {})
  }

  const onChipPress = (chip: OutType) => {
    chip.isChecked = !chip.isChecked
    const newTags = form.tags
    if (chip.isChecked && !newTags.includes(chip)) {
      newTags.push(chip)
    } else {
      newTags.splice(newTags.indexOf(chip), 1)
    }

    formChanged({ tags: newTags })
  }

  return (
    <View style={style.container}>
      <Text>记一笔</Text>
      <View style={style.count}>
        <TextInput
          label="金额"
          value={form.count}
          onChangeText={text => formChanged({ count: text })}
          keyboardType="numeric"
          style={{ flex: 3 }}
          right={
            tips && (
              <TextInput.Icon icon="alert-circle-outline" color="#6750a4" />
            )
          }
        />
        <CountTypePicker
          index={countTypeIndex}
          setIndex={index =>
            dispatch({ type: 'countTypeIndex', payload: index })
          }
        />
      </View>
      <View style={style.countType}>
        <Chip
          selected={form.type === 'in'}
          onPress={() => formChanged({ type: 'in' })}>
          收入
        </Chip>
        <Chip
          selected={form.type === 'out'}
          style={{ marginLeft: 5 }}
          onPress={() => formChanged({ type: 'out' })}>
          支出
        </Chip>
      </View>
      {form.type === 'out' && (
        <CustomChipPane items={outTypes} onPress={onChipPress} />
      )}
      <TextInput
        label="备注"
        style={{ width: '100%', height: 100, marginTop: 20 }}
        mode="outlined"
        multiline
        value={form.note}
        onChangeText={text => formChanged({ note: text })}
      />
      <ImagePicker
        uploaded={assets => formChanged({ image: assets })}
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
