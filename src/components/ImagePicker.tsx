import { useState } from 'react'
import { Pressable, Image, StyleSheet, Text, View } from 'react-native'
import { Icon, IconButton, useTheme } from 'react-native-paper'
import { handleImage, logging } from '~utils'

const ImagePicker: React.FC<Props> = ({ isShow = true, uploaded }) => {
  const theme = useTheme()
  const [image, setImage] = useState('')
  const onUploadPress = async () => {
    const res = await handleImage({ limit: 1 })
    const uri = res ? res[0].uri : ''
    if (uri) {
      logging.info('image uri:', uri)
      setImage(uri)
      uploaded(uri)
    }
  }
  const onRemovePress = () => {
    setImage('')
  }
  return (
    <Pressable style={[style.container, { opacity: isShow ? 1 : 0 }]} pointerEvents={isShow ? 'auto' : 'none'}>
      {image ? (
        <View style={style.imageArea}>
          <Image
            source={{ uri: image }}
            style={[style.image, { backgroundColor: theme.colors.surfaceVariant }]}
            resizeMode="cover"
          />
          <View style={style.imageFunc}>
            <IconButton icon={'reload'} size={24} iconColor={theme.colors.primary} onPress={onUploadPress} />
            <IconButton
              icon={'delete-forever-outline'}
              size={24}
              iconColor={theme.colors.primary}
              onPress={onRemovePress}
            />
          </View>
        </View>
      ) : (
        <Pressable onPress={onUploadPress} style={[style.uploadArea, { borderColor: theme.colors.outlineVariant }]}>
          <Icon source="upload" size={24} color={theme.colors.primary} />
          <Text style={[style.uploadText, { color: theme.colors.onSurfaceVariant }]}>从相册选择 / 拍照</Text>
        </Pressable>
      )}
    </Pressable>
  )
}

const style = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  uploadText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  imageArea: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    borderRadius: 12,
  },
  image: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: 12,
  },
  imageFunc: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
})

interface Props {
  /** 设置透明度而不是不渲染 */
  isShow?: boolean
  uploaded: (assets: any) => void
}

export default ImagePicker
