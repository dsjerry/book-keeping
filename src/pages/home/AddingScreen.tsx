import { useState, useEffect } from 'react'

import { View, Text, StyleSheet, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import { TextInput, Chip, Button, Modal, Portal, IconButton, useTheme } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
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
  const theme = useTheme() // 获取当前主题
  const [tips, setTips] = useState('')
  const [keyboardStatus, setKeyboardStatus] = useState<'showed' | 'hidden'>('hidden')
  const [outTypes, setOutTypes] = useState<OutType[]>([])
  const [isSubmit, setIsSubmit] = useState(false)
  const [countTypeIndex, setCountTypeIndex] = useState(0)
  const [noteModalVisible, setNoteModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

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

    // 初始化日期为当前日期
    formChanged({ date: Date.now() })

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

      // 如果是编辑模式，设置已保存的日期
      if (item.date) {
        setSelectedDate(new Date(item.date))
      }
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

  // 处理日期变更
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
      formChanged({ date: date.getTime() }) // 转换为时间戳存储
    }
  }

  // 格式化日期显示
  const formatDisplayDate = (date: Date) => {
    return format(date, 'yyyy年MM月dd日')
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
    <View style={[style.container, { backgroundColor: theme.colors.background }]}>
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

      {/* 日期选择器 */}
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={[style.dateSelector, { borderBottomColor: theme.colors.outlineVariant }]}>
        <Text style={[style.dateLabel, { color: theme.colors.onSurfaceVariant }]}>日期:</Text>
        <Text style={[style.dateValue, { color: theme.colors.onBackground }]}>{formatDisplayDate(selectedDate)}</Text>
        <IconButton icon="calendar" size={20} />
      </TouchableOpacity>

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()} // 限制最大日期为今天
        />
      )}
      {showDatePicker && Platform.OS === 'ios' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
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
      <TouchableOpacity onPress={() => setNoteModalVisible(true)} style={{ width: '100%', marginTop: 20 }}>
        <TextInput
          label="备注"
          style={{ width: '100%' }}
          mode="outlined"
          value={form.note}
          showSoftInputOnFocus={false}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={noteModalVisible}
          onDismiss={() => setNoteModalVisible(false)}
          contentContainerStyle={[style.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[style.modalTitle, { color: theme.colors.primary }]}>填写备注</Text>
          <TextInput
            style={style.noteInput}
            mode="outlined"
            multiline
            value={form.note}
            onChangeText={text => formChanged({ note: text })}
            autoFocus
          />
          <View style={style.modalButtons}>
            <Button mode="text" onPress={() => setNoteModalVisible(false)} style={{ marginRight: 10 }}>
              取消
            </Button>
            <Button mode="contained" onPress={() => setNoteModalVisible(false)}>
              确定
            </Button>
          </View>
        </Modal>
      </Portal>
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
  dateSelector: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    marginTop: 10,
    borderBottomWidth: 1,
    // 边框颜色将通过主题动态设置
  },
  dateLabel: {
    fontSize: 16,
    // 颜色将通过主题动态设置
    marginRight: 10,
  },
  dateValue: {
    fontSize: 16,
    flex: 1,
    // 颜色将通过主题动态设置
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
  modalContainer: {
    // 背景色将通过主题动态设置
    padding: 20,
    margin: 20,
    borderRadius: 10,
    // 确保弹窗在键盘上方
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noteInput: {
    width: '100%',
    minHeight: 150,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
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
