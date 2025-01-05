import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Config from 'react-native-config'

import { _COLORS } from '~consts/Colors'

interface Desc {
  id: number
  text: string
  isLink: boolean
}

export default function () {
  const [version, setVersion] = useState('')
  const [desc, setDesc] = useState<Desc[]>()
  const [isShowLoading, setIsShowLoading] = useState(false)

  useEffect(() => {
    setVersion('0.0.1')
    setDesc([
      {
        id: 0,
        text: `${Config.AUTHOR} aka ${Config.AUTHOR_AKA} at ${Config.SITE}`,
        isLink: false,
      },
      {
        id: 2,
        text: `contact: ${Config.EMAIL}`,
        isLink: false,
      },
      {
        id: 1,
        text: `Copyright © 2024 ${Config.AUTHOR}. All rights reserved.`,
        isLink: false,
      },
    ])
  }, [])

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <Image source={{ uri: 'https://imgse.com/i/hxupjg' }} style={styles.logo} />
        <Text style={styles.appName}>{Config.APP_NAME}</Text>
        <Text style={{ textAlign: 'center' }}>版本: {version}</Text>
      </View>
      <View style={styles.footer}>
        {desc?.map(item => (
          <Text key={item.id} style={styles.desc}>
            {item.text}
          </Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  appName: {
    marginVertical: 24,
    fontSize: 24,
    fontWeight: 'bold',
    color: _COLORS.main_50,
  },
  logo: {
    marginTop: 40,
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  desc: {
    textAlign: 'center',
    marginTop: 8,
  },
})
