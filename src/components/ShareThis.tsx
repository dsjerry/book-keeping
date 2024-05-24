import { useRef, useEffect, useCallback, useState } from 'react'
import { View, Button, StyleSheet, Text, Image } from 'react-native'
import ViewShot from 'react-native-view-shot'
import { captureRef } from 'react-native-view-shot'
import Share from 'react-native-share'

interface Props {
  // 将被分享的内容
  children?: React.ReactNode
}

// const ShareThis: React.FC<Props> = ({ children }) => {
//   const ref = useRef<any>(null)

//   return (
//     <ViewShot ref={ref}>
//       {children}
//     </ViewShot>
//   )
// }

const ShareThis: React.FC<Props> = ({ children }) => {
  const viewShotRef = useRef<any>(null)

  const captureAndShareScreenshot = async () => {
    try {
      // 捕获视图获取 URI
      const uri = await viewShotRef.current.capture()
      // 准备图片分享
      const shareOptions = {
        title: '分享到',
        url: uri,
        failOnCancel: false,
      }
      // 分享图片
      await Share.open(shareOptions)
    } catch (error) {
      console.error('节点捕获出错:', error)
    }
  }

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        <View style={styles.captureView}>{children}</View>
      </ViewShot>
      <Button title="Capture and Share" onPress={captureAndShareScreenshot} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureView: {
    width: 300,
    height: 300,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ShareThis
