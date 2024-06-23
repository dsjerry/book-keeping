import { useState, useRef } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { HelperText, IconButton, Snackbar } from 'react-native-paper'

import CustomChipPane from '~components/CustomChipPane'
import CustomDivider from '~components/CustomDivider'
import CustomDialog from '~components/CustomDialog'
import { _COLORS } from '~consts/Colors'
import { OutTypes } from '~consts/Data'
import { useUserContext } from './contexts/UserContext'

const AddTagsScreen = () => {
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

  const onTagPress = (tag: OutType) => {}

  const onCustomTagPress = (tag: OutType) => {
    setCurrentTags(tag)
    setIsShowDialog(true)
  }

  const handleAddTags = (str: string) => {
    if (!str.trim()) return
    const _str = str.trim().replace('，', ',')
    const strArr = _str.split(',').map(item => item.substring(0, 4))

    const tagsBeAdded = strArr.map(item => ({
      id: Date.now().toString(),
      name: item,
      alias: item,
      icon: 'tag-plus-outline',
      isChecked: false,
      isCustom: true,
    }))
    userStore.setTags(tagsBeAdded)

    inputRef.current?.clear()
  }

  // 触发：点击删除按钮、键盘确认按钮
  const handleDelTag = () => {
    const str = tagBeDel.trim()
    if (!str) return
    if (str !== currentTags?.name) return

    userStore.removeTag(currentTags)

    setIsShowDialog(false)
    setSnackBar({
      visible: true,
      message: '删除标签成功',
    })
  }

  return (
    <View style={style.container}>
      <View style={style.inputArea}>
        <TextInput
          ref={inputRef}
          placeholder="添加标签"
          style={{ borderBottomWidth: 1, borderBottomColor: _COLORS.main_50 }}
          onSubmitEditing={e => handleAddTags(e.nativeEvent.text)}
        />
        <HelperText type="info" style={{ color: _COLORS.main_50 }}>
          每个标签限制4个字符, 可添加多个标签, 以逗号分隔
        </HelperText>
      </View>
      <CustomDivider text="默认标签" textPosi="left" />
      <CustomChipPane items={OutTypes} onPress={item => onTagPress(item)} />
      <CustomDivider text="自定义标签" textPosi="left" />
      <CustomChipPane
        items={currentUser?.tags?.filter(item => item.isCustom) || []}
        onPress={item => onCustomTagPress(item)}
      />
      {currentUser?.tags?.length == 0 && (
        <Text
          style={{ color: _COLORS.main_50, textAlign: 'center' }}
          onPress={() => inputRef.current.focus()}>
          暂无自定义标签，去添加
        </Text>
      )}
      {isShowDialog && currentTags && (
        <CustomDialog
          width={380}
          indicator={false}
          onBackdropPress={() => setIsShowDialog(false)}>
          <Text style={dialog.title}>管理标签</Text>
          <View style={dialog.editArea}>
            <CustomChipPane items={[currentTags]} onPress={item => {}} />
            <TextInput
              style={dialog.input}
              placeholder="修改名称"
              onChangeText={text =>
                setCurrentTags({ ...currentTags, name: text })
              }
            />
          </View>
          <CustomDivider text="危险操作" />
          <View style={dialog.delArea}>
            <TextInput
              style={{ textAlign: 'center' }}
              placeholder="输入标签名删除此标签"
              value={tagBeDel}
              onChangeText={text => setTagBeDel(text)}
              onSubmitEditing={handleDelTag}
            />
            {tagBeDel === currentTags.name && (
              <IconButton
                icon="delete-forever-outline"
                iconColor="#e54166"
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
        style={{
          backgroundColor: _COLORS.main,
          marginLeft: 20,
          marginRight: -20,
        }}
        visible={snackBar.visible}
        onDismiss={() => setSnackBar({ ...snackBar, visible: false })}>
        {snackBar.message}
      </Snackbar>
    </View>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputArea: {
    marginBottom: 20,
  },
})

const dialog = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: _COLORS.main,
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
    borderBottomWidth: 1,
    borderBottomColor: _COLORS.main_50,
  },
})

export default AddTagsScreen
