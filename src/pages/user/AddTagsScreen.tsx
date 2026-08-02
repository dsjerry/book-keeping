import { useState, useRef } from 'react'
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { TextInput, HelperText, IconButton, Button, Snackbar, useTheme } from 'react-native-paper'

import CustomChipPane from '~components/CustomChipPane'
import CustomDivider from '~components/CustomDivider'
import CustomDialog from '~components/CustomDialog'
import { OutTypes } from '~consts/Data'
import { useUserContext } from './contexts/UserContext'

const AddTagsScreen = () => {
  const theme = useTheme()
  // paper 5.x 的 TextInput ref 类型为 RN TextInput 与 TextInputHandles 的混合联合，
  // useRef 无法干净表达，此处 any 为库类型怪癖的务实妥协
  const inputRef = useRef<any>(null)
  const [currentTags, setCurrentTags] = useState<OutType>() // 正在编辑的tag
  const [isShowDialog, setIsShowDialog] = useState(false)
  const [tagBeDel, setTagBeDel] = useState('') // 输入标签名确认删除标签
  const [snackBar, setSnackBar] = useState({
    visible: false,
    message: '删除成功',
  })

  const { userStore } = useUserContext()
  const { currentUser } = userStore

  const customTags = currentUser?.tags?.filter(item => item.isCustom) || []

  const onTagPress = (tag: OutType) => {}

  const onCustomTagPress = (tag: OutType) => {
    setCurrentTags(tag)
    setIsShowDialog(true)
  }

  const handleAddTags = (str: string) => {
    if (!str.trim()) return
    // 全角逗号（，）与半角逗号（,）统一按逗号分割
    const strArr = str
      .trim()
      .replace(/[,，]/g, ',')
      .split(',')
      .map(item => item.trim().substring(0, 4))
      .filter(Boolean)

    if (strArr.length === 0) return

    const tagsBeAdded = strArr.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      name: item,
      alias: item,
      icon: 'tag-plus-outline',
      isChecked: false,
      isCustom: true,
    }))
    userStore.setTags(tagsBeAdded)

    inputRef.current?.clear()
  }

  // 保存修改后的标签（名称/别名同步更新）
  const handleSaveTag = () => {
    if (!currentTags) return
    if (!currentTags.name.trim()) return // 名称不能为空
    userStore.updateTag({ ...currentTags, alias: currentTags.name.trim() })
    setIsShowDialog(false)
  }

  // 触发：点击删除按钮、键盘确认按钮
  const handleDelTag = () => {
    const str = tagBeDel.trim()
    if (!str) return
    if (str !== currentTags?.name) return

    userStore.removeTag(currentTags)

    setIsShowDialog(false)
    setTagBeDel('')
    setSnackBar({
      visible: true,
      message: '删除标签成功',
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, flexGrow: 1 }}>
        {/* Card: Input Area */}
        <View
          style={{
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceVariant,
            paddingVertical: 12,
            paddingHorizontal: 12,
            marginBottom: 16,
          }}>
          <TextInput
            ref={inputRef}
            mode="outlined"
            placeholder="添加标签"
            onSubmitEditing={e => handleAddTags(e.nativeEvent.text)}
            outlineStyle={{ borderRadius: 12 }}
          />
          <HelperText type="info" style={{ color: theme.colors.onSurfaceVariant }}>
            每个标签限制4个字符, 可添加多个标签, 以逗号分隔
          </HelperText>
        </View>

        {/* Card: Default Tags */}
        <View
          style={{
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceVariant,
            paddingVertical: 12,
            paddingHorizontal: 12,
            marginBottom: 16,
          }}>
          <CustomDivider text="默认标签" textPosi="left" style={{ marginVertical: 8 }} />
          <CustomChipPane items={OutTypes} onPress={item => onTagPress(item)} />
        </View>

        {/* Card: Custom Tags */}
        <View
          style={{
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceVariant,
            paddingVertical: 12,
            paddingHorizontal: 12,
            marginBottom: 16,
          }}>
          <CustomDivider text="自定义标签" textPosi="left" style={{ marginVertical: 8 }} />
          <CustomChipPane items={customTags} onPress={item => onCustomTagPress(item)} />
          {customTags.length === 0 && (
            <Text
              style={{ color: theme.colors.primary, textAlign: 'center', marginTop: 12 }}
              onPress={() => inputRef.current?.focus()}>
              暂无自定义标签，去添加
            </Text>
          )}
        </View>
      </ScrollView>
      {isShowDialog && currentTags && (
        <CustomDialog width={Dimensions.get('window').width * 0.85} indicator={false} onBackdropPress={handleSaveTag}>
          <Text style={[dialog.title, { color: theme.colors.primary }]}>管理标签</Text>
          <View style={dialog.editArea}>
            <CustomChipPane items={[currentTags]} onPress={item => {}} />
            <TextInput
              style={dialog.input}
              mode="outlined"
              placeholder="修改名称"
              outlineStyle={{ borderRadius: 12 }}
              onChangeText={text => setCurrentTags({ ...currentTags, name: text })}
            />
          </View>
          <Button mode="contained" style={dialog.saveBtn} onPress={handleSaveTag}>
            保存
          </Button>
          <CustomDivider text="危险操作" />
          <View style={dialog.delArea}>
            <TextInput
              style={{ textAlign: 'center' }}
              mode="outlined"
              placeholder="输入标签名删除此标签"
              value={tagBeDel}
              outlineStyle={{ borderRadius: 12 }}
              onChangeText={text => setTagBeDel(text)}
              onSubmitEditing={handleDelTag}
            />
            {tagBeDel === currentTags.name && (
              <IconButton
                icon="delete-forever-outline"
                iconColor={theme.colors.error}
                style={{ position: 'absolute', right: 0 }}
                onPress={handleDelTag}
              />
            )}
          </View>
        </CustomDialog>
      )}
      <Snackbar
        duration={2500}
        action={{
          label: '关闭',
          onPress: () => {
            setSnackBar({ ...snackBar, visible: false })
          },
        }}
        style={{ backgroundColor: theme.colors.inverseSurface }}
        visible={snackBar.visible}
        onDismiss={() => setSnackBar({ ...snackBar, visible: false })}>
        {snackBar.message}
      </Snackbar>
    </View>
  )
}

const dialog = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  editArea: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
  },
  delArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: 150,
    marginLeft: 10,
  },
  saveBtn: {
    marginTop: 12,
    borderRadius: 12,
  },
})

export default AddTagsScreen
