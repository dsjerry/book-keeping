import { useState, useEffect, useCallback, useRef } from 'react'

import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { TextInput, Button, Modal, Portal, IconButton, useTheme } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { useNavigation, useRoute } from '@react-navigation/native'

import CustomChipPane from '~components/CustomChipPane'
import SegmentedControl from '~components/SegmentedControl'
import { CountTypePicker } from './components'
import ImagePicker from '~components/ImagePicker'
import { useHomeStore, useHomeStoreDispatch } from './contexts/HomeContext'
import { useKeepingStore } from '~store/keepingStore'
import { KeepingService } from '~api/keeping'
import { useAppSettingsStore } from '~store/settingStore'
import { useUserStore } from '~store/userStore'
import { CountTypeList, OutTypes } from '~consts/Data'
import { withAlpha } from '~utils'

const Adding: React.FC<Props> = ({ route }) => {
  const theme = useTheme()
  const [tips, setTips] = useState('')
  const [keyboardStatus, setKeyboardStatus] = useState<'showed' | 'hidden'>('hidden')
  const [outTypes, setOutTypes] = useState<OutType[]>([])
  const [isSubmit, setIsSubmit] = useState(false)
  const [countTypeIndex, setCountTypeIndex] = useState(0)
  const [noteModalVisible, setNoteModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const tagInputRef = useRef<any>(null)
  const [editTag, setEditTag] = useState<OutType | null>(null)
  const [tagEditText, setTagEditText] = useState('')

  const { add, update, items } = useKeepingStore()
  const { confirmExitEdit } = useAppSettingsStore()
  const { currentUser, setTags, updateTag, removeTag } = useUserStore()

  const { form, modal } = useHomeStore()
  const dispatch = useHomeStoreDispatch()

  const navigation = useNavigation()
  const { params }: ScreenParam.Adding = useRoute()

  const formChanged = (item: Partial<KeepingItem>) => {
    dispatch({ type: 'addForm', payload: item })
  }

  const handleBeforeRemove = useCallback(
    (e: any) => {
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
    },
    [confirmExitEdit, dispatch, modal, navigation],
  )

  useEffect(() => {
    let _tags = [] as OutType[]
    if (currentUser?.tags) {
      _tags = [...currentUser.tags]
      // 补全 OutTypes 中新增的默认标签（如"词元"），已有的默认标签不会重复添加
      OutTypes.forEach(def => {
        if (!_tags.some(t => t.id === def.id)) {
          _tags.push(def)
        }
      })
    } else {
      _tags = [...OutTypes]
    }

    setOutTypes([..._tags])

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

      setOutTypes(
        newTag.map(t => ({
          ...t,
          isChecked: item.tags.some(saved => saved.id === t.id),
        })),
      )
      dispatch({ type: 'fromEditing', payload: item })

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let unsubscribe: any
    if (!isSubmit) {
      navigation.addListener('beforeRemove', handleBeforeRemove)
    } else {
      unsubscribe = navigation.removeListener('beforeRemove', handleBeforeRemove)
    }

    return unsubscribe
  }, [navigation, isSubmit, handleBeforeRemove])

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false)
    if (date) {
      setSelectedDate(date)
      formChanged({ date: date.getTime() })
    }
  }

  const formatDisplayDate = (date: Date) => {
    return format(date, 'yyyy年MM月dd日')
  }

  const onAddPress = async () => {
    setIsSubmit(true)
    if (form.count === `0` || !form.count) {
      setTimeout(() => setTips(''), 1500)
      return setTips('请输入金额')
    }
    // 启用同步时把本地图片上传到服务器，换成可跨设备访问的 URL（失败自动回退本地路径）
    const uploadedImage = await KeepingService.uploadKeepingImage(form.image)
    const saved = uploadedImage === form.image ? form : { ...form, image: uploadedImage }
    if (params?.isEdit) {
      update(saved as KeepingItem)
    } else {
      add(saved as KeepingItem)
    }
    navigation.navigate('HomeScreen', {})
  }

  const onTypeSwitch = (index: number) => {
    const type = index === 1 ? 'out' : 'in'
    if (form.type === type) return
    formChanged({ type })
  }

  const onChipPress = (chip: OutType) => {
    const checked = !chip.isChecked
    const current = form.tags || []
    const nextTags = current.filter(t => t.id !== chip.id)
    if (checked) {
      nextTags.push({ ...chip, isChecked: true })
    }
    formChanged({ tags: nextTags })
    setOutTypes(prev => prev.map(t => (t.id === chip.id ? { ...t, isChecked: checked } : t)))
  }

  // 添加自定义标签（逗号分隔，每项限制4字）
  const handleAddCustomTags = () => {
    const input = tagInput.trim()
    if (!input) return
    const names = input
      .replace(/[,，]/g, ',')
      .split(',')
      .map(s => s.trim().substring(0, 10))
      .filter(Boolean)
    if (names.length === 0) return

    const newTags: OutType[] = names.map((name, i) => ({
      id: `${Date.now()}-${i}`,
      name,
      alias: name,
      icon: 'tag-plus-outline',
      isChecked: false,
      isCustom: true,
    }))

    setTags(newTags)
    setOutTypes(prev => [...prev, ...newTags])
    setTagInput('')
    tagInputRef.current?.clear()
  }

  // 长按自定义标签 → 打开编辑/删除对话框
  const handleTagLongPress = (tag: OutType) => {
    if (!tag.isCustom) return
    setEditTag(tag)
    setTagEditText(tag.name)
  }

  // 保存修改后的标签名称
  const handleSaveTag = () => {
    if (!editTag) return
    const newName = tagEditText.trim()
    if (!newName) return
    const updated = { ...editTag, name: newName.substring(0, 10), alias: newName.substring(0, 10) }
    updateTag(updated)
    setOutTypes(prev => prev.map(t => (t.id === updated.id ? updated : t)))
    setEditTag(null)
  }

  // 删除自定义标签
  const handleDeleteTag = () => {
    if (!editTag) return
    removeTag(editTag)
    setOutTypes(prev => prev.filter(t => t.id !== editTag.id))
    // 如果该标签已勾选，从 form.tags 中移除
    const current = form.tags || []
    formChanged({ tags: current.filter(t => t.id !== editTag.id) })
    setEditTag(null)
  }

  return (
    <View style={[style.container, { backgroundColor: theme.colors.background }]}>
      {/* ===== Header ===== */}
      <View style={[style.headerRow, { borderBottomColor: theme.colors.outlineVariant }]}>
        <IconButton icon="close" size={24} onPress={() => navigation.goBack()} />
        <Text style={[style.headerTitle, { color: theme.colors.onBackground }]}>
          {params?.isEdit ? '编辑' : '记一笔'}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1 }}>
          {/* ===== Scrollable content ===== */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={style.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* ===== Amount hero section ===== */}
            <View style={style.amountSection}>
              <TextInput
                value={form.count}
                onChangeText={text => formChanged({ count: text })}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={withAlpha(theme.colors.onSurfaceVariant, 0.38)}
                style={[style.amountInput, { color: theme.colors.onBackground }]}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                underlineStyle={{ display: 'none' }}
              />
              {tips ? <Text style={[style.tipsText, { color: theme.colors.error }]}>{tips}</Text> : null}
              <View style={style.pickerWrapper}>
                <CountTypePicker
                  index={countTypeIndex}
                  setIndex={index => {
                    setCountTypeIndex(index)
                    formChanged({ countType: CountTypeList[index] as any })
                  }}
                />
              </View>
            </View>

            {/* ===== Income/Expense segmented control ===== */}
            <SegmentedControl
              options={['收入', '支出']}
              activeIndex={form.type === 'out' ? 1 : 0}
              onChange={onTypeSwitch}
              style={{ marginBottom: 24 }}
            />

            {/* ===== 日期 section ===== */}
            <View style={style.section}>
              <Text style={[style.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>日期</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[style.outlinedCard, { borderColor: theme.colors.outlineVariant }]}>
                <IconButton icon="calendar" size={20} />
                <Text style={[style.dateValue, { color: theme.colors.onBackground }]}>
                  {formatDisplayDate(selectedDate)}
                </Text>
                <IconButton icon="chevron-right" size={20} />
              </TouchableOpacity>
            </View>

            {/* ===== 类别 section (only for out) ===== */}
            {form.type === 'out' && (
              <View style={style.section}>
                <Text style={[style.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>类别</Text>
                <CustomChipPane items={outTypes} onPress={onChipPress} onLongPress={handleTagLongPress} />
                {/* 自定义标签输入 */}
                <TextInput
                  ref={tagInputRef}
                  mode="outlined"
                  placeholder="添加标签（4字以内，逗号分隔）"
                  placeholderTextColor={withAlpha(theme.colors.onSurfaceVariant, 0.5)}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddCustomTags}
                  maxLength={20}
                  dense
                  style={{ marginTop: 10, borderRadius: 12 }}
                  outlineStyle={{ borderRadius: 12 }}
                  right={
                    tagInput.trim() ? (
                      <TextInput.Icon icon="plus-circle" color={theme.colors.primary} onPress={handleAddCustomTags} />
                    ) : undefined
                  }
                />
              </View>
            )}

            {/* ===== 地点 section ===== */}
            <View style={style.section}>
              <Text style={[style.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>地点</Text>
              <Button
                icon="map-marker"
                mode="outlined"
                style={style.addressBtn}
                onPress={() => navigation.navigate('AddressDetailScreen')}>
                {form?.address?.name || '获取地址'}
              </Button>
            </View>

            {/* ===== 图片 section ===== */}
            <View style={style.section}>
              <Text style={[style.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>图片</Text>
              <ImagePicker uploaded={assets => formChanged({ image: assets })} isShow={keyboardStatus !== 'showed'} />
            </View>

            {/* ===== 备注 section ===== */}
            <View style={style.section}>
              <Text style={[style.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>备注</Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(true)} style={{ width: '100%' }}>
                <View
                  style={[
                    style.outlinedCard,
                    { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface },
                  ]}>
                  <Text
                    style={[
                      style.noteDisplayText,
                      {
                        color: form.note ? theme.colors.onBackground : theme.colors.onSurfaceVariant,
                      },
                    ]}
                    numberOfLines={1}>
                    {form.note || '添加备注...'}
                  </Text>
                  <IconButton icon="pencil-outline" size={18} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* ===== Footer save button ===== */}
          <View style={[style.footer, { borderTopColor: theme.colors.outlineVariant }]}>
            <Button mode="contained-tonal" style={style.addBtn} onPress={onAddPress}>
              保存
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ===== Date picker ===== */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* ===== Note modal ===== */}
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

      {/* ===== 自定义标签编辑/删除对话框 ===== */}
      <Portal>
        <Modal
          visible={!!editTag}
          onDismiss={() => setEditTag(null)}
          contentContainerStyle={[style.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[style.modalTitle, { color: theme.colors.primary }]}>管理标签</Text>
          <TextInput
            mode="outlined"
            value={tagEditText}
            onChangeText={setTagEditText}
            placeholder="修改名称（10字以内）"
            maxLength={10}
            style={{ marginBottom: 12, borderRadius: 12 }}
            outlineStyle={{ borderRadius: 12 }}
          />
          <Button mode="contained" onPress={handleSaveTag} style={{ marginBottom: 8, borderRadius: 12 }}>
            保存
          </Button>
          <Button mode="outlined" textColor={theme.colors.error} onPress={handleDeleteTag} style={{ borderRadius: 12 }}>
            删除标签
          </Button>
        </Modal>
      </Portal>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    height: 60,
    backgroundColor: 'transparent',
  },
  tipsText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  pickerWrapper: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  outlinedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateValue: {
    fontSize: 16,
    flex: 1,
    marginLeft: 4,
  },
  addressBtn: {
    width: '100%',
    borderRadius: 12,
  },
  noteDisplayText: {
    flex: 1,
    fontSize: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  addBtn: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 4,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
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

interface Props {
  route?: ScreenParam.Adding
}

export default Adding
