import { useState } from 'react'
import { Pressable, Image, StyleSheet, Text, View } from 'react-native'
import { Icon, IconButton } from 'react-native-paper'
import { handleImage } from '~utils'
import { logging } from '~utils'

const ImagePicker: React.FC<Props> = ({ isShow = true, uploaded }) => {
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
  // 记得指定 Image 的宽高
  return (
    <Pressable
      style={{
        ...style.container,
        opacity: isShow ? 1 : 0,
      }}>
      {image ? (
        <View style={style.imageArea}>
          <Image source={{ uri: image, width: 350, height: 200 }} />
          <View style={style.imageFunc}>
            <IconButton
              icon={'reload'}
              size={24}
              iconColor={'#6d57a7'}
              onPress={onUploadPress}
            />
            <IconButton
              icon={'delete-forever-outline'}
              size={24}
              iconColor={'#6d57a7'}
              onPress={onRemovePress}
            />
          </View>
        </View>
      ) : (
        <Pressable onPress={onUploadPress} style={style.uploadArea}>
          <Icon source="upload" size={24} color={'#6d57a7'} />
          <Text style={style.uploadText}>从相册选择 / 拍照</Text>
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
    height: 200,
    borderWidth: 2,
    borderColor: '#e7e0ec',
    borderRadius: 5,
  },
  uploadText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  imageArea: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: '#fffbfe',
    borderRadius: 4,
    elevation: 2,
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
