import { useState, useEffect } from 'react'

import { View, Text, StyleSheet, Keyboard } from 'react-native'
import { TextInput, Chip, Button } from 'react-native-paper'
import { useNavigation, useRoute } from '@react-navigation/native'

import CustomChipPane from '~components/CustomChipPane'
import { CountTypePicker } from './components'
import ImagePicker from '~components/ImagePicker'
import { useHomeStore, useHomeStoreDispatch } from './contexts/HomeContext'
import { useKeepingStore } from '~store/keepingStore'
import { useAppSettingsStore } from '~store/settingStore'
import { useUserStore } from '~store/userStore'
import { CountTypeList, OutTypes } from '~consts/Data'

const Adding: React.FC<Props> = ({ route }) => {
  const [tips, setTips] = useState('')
  const [keyboardStatus, setKeyboardStatus] = useState<'showed' | 'hidden'>('hidden')
  const [outTypes, setOutTypes] = useState<OutType[]>([])
  const [isSubmit, setIsSubmit] = useState(false)
  const [countTypeIndex, setCountTypeIndex] = useState(0)

  const { add, update, items } = useKeepingStore()
  const { confirmExitEdit } = useAppSettingsStore()
  const { currentUser } = useUserStore()

  const { form, modal } = useHomeStore()
  const dispatch = useHomeStoreDispatch()

  const navigation = useNavigation()
  const { params }: ScreenParam.Adding = useRoute()

  function handleBeforeRemove(e: any) {
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
  }

  useEffect(() => {
    let _tags = [] as OutType[]
    if (currentUser?.tags) {
      _tags = currentUser.tags
    } else {
      _tags = [...OutTypes]
    }

    setOutTypes([..._tags])

    if (!currentUser && items.length === 0) {
      dispatch({
        type: 'modal',
        payload: {
          ...modal,
          isShow: true,
          body: '未登录账号可能会导致数据丢失，是否立即注册？',
          onAccess: () => {
            navigation.navigate('User', { screen: 'LoginScreen' })
            dispatch({
              type: 'modal',
              payload: { ...modal, isShow: false, status: true },
            })
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

    if (params && params?.isEdit) {
      const item = params.item!
      const newTag = _tags
      for (let i = 0; i < item.tags.length; i++) {
        const tag = item.tags[i]
        const index = _tags.findIndex(t => t.id === tag.id)
        if (index > -1) {
          newTag[index] = tag
        } else {
          newTag.push(tag)
        }
      }

      setOutTypes([...newTag])
      dispatch({ type: 'fromEditing', payload: item })
    }

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus('showed')
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus('hidden')
    })

    return () => {
      dispatch({ type: 'emptyForm' })
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  useEffect(() => {
    let unsubscribe: any
    if (!isSubmit) {
      navigation.addListener('beforeRemove', handleBeforeRemove)
    } else {
      unsubscribe = navigation.removeListener('beforeRemove', handleBeforeRemove)
    }

    return unsubscribe
  }, [navigation, isSubmit])

  const formChanged = (item: Partial<KeepingItem>) => {
    dispatch({ type: 'addForm', payload: { ...form, ...item } })
  }

  const onAddPress = () => {
    setIsSubmit(true)
    if (form.count === `0` || !form.count) {
      setTimeout(() => setTips(''), 1500)
      return setTips('请输入金额')
    }
    if (params?.isEdit) {
      update(form as KeepingItem)
    } else {
      add(form as KeepingItem)
    }
    navigation.navigate('HomeScreen', {})
  }

  const onChipPress = (chip: OutType) => {
    chip.isChecked = !chip.isChecked
    const newTags = form.tags
    if (chip.isChecked && !newTags?.includes(chip)) {
      newTags?.push(chip)
    } else {
      newTags?.splice(newTags.indexOf(chip), 1)
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
          right={tips && <TextInput.Icon icon="alert-circle-outline" color="#6750a4" />}
        />
        <CountTypePicker
          index={countTypeIndex}
          setIndex={index => {
            setCountTypeIndex(index)
            formChanged({ countType: CountTypeList[index] as any })
          }}
        />
      </View>
      <View style={style.countType}>
        <Chip selected={form.type === 'in'} onPress={() => formChanged({ type: 'in' })}>
          收入
        </Chip>
        <Chip selected={form.type === 'out'} style={{ marginLeft: 5 }} onPress={() => formChanged({ type: 'out' })}>
          支出
        </Chip>
      </View>
      {form.type === 'out' && <CustomChipPane items={outTypes} onPress={onChipPress} />}
      <View style={addressStyle.pane}>
        <Button icon={'map-marker'} style={addressStyle.btn} onPress={() => navigation.navigate('AddressDetailScreen')}>
          {form?.address?.name || '获取地址'}
        </Button>
      </View>
      <ImagePicker uploaded={assets => formChanged({ image: assets })} isShow={keyboardStatus !== 'showed'} />
      <TextInput
        label="备注"
        style={{ width: '100%', height: 100, marginTop: 20 }}
        mode="outlined"
        multiline
        value={form.note}
        onChangeText={text => formChanged({ note: text })}
      />
      <Button mode="contained-tonal" style={style.addBtn} onPress={onAddPress}>
        保存
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
    overflow: "scroll"
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
    marginBottom: 20,
  },
  addBtn: {
    width: '100%',
    marginTop: 'auto',
    borderRadius: 5,
  },
})

const addressStyle = StyleSheet.create({
  pane: {
    width: '100%',
    marginVertical: 20,
  },
  btn: {
    alignSelf: 'flex-start',
  },
})

interface Props {
  route?: ScreenParam.Adding
}

export default Adding
