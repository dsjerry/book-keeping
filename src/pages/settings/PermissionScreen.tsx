import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, Platform, PermissionsAndroid } from 'react-native'
import type { Permission } from 'react-native'
import { List, useTheme, Snackbar, Chip } from 'react-native-paper'

interface PermissionItem {
  name: string
  description: string
  permission: Permission
  dangerous: boolean
  icon: string
}

const PERMISSIONS: PermissionItem[] = [
  {
    name: '相机',
    description: '拍照上传头像/凭证',
    permission: PermissionsAndroid.PERMISSIONS.CAMERA,
    dangerous: true,
    icon: 'camera',
  },
  {
    name: '存储读取',
    description: '读取本地图片',
    permission: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    dangerous: true,
    icon: 'file-image-outline',
  },
  {
    name: '存储写入',
    description: '保存导出文件',
    permission: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    dangerous: true,
    icon: 'file-export-outline',
  },
  {
    name: '定位',
    description: '获取当前位置用于记账地点',
    permission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    dangerous: true,
    icon: 'crosshairs-gps',
  },
  {
    name: '网络',
    description: '访问网络服务',
    permission: 'android.permission.INTERNET' as Permission,
    dangerous: false,
    icon: 'wifi',
  },
  {
    name: '生物识别',
    description: '指纹/面容解锁',
    permission: 'android.permission.USE_BIOMETRIC' as Permission,
    dangerous: false,
    icon: 'fingerprint',
  },
]

export default function PermissionScreen() {
  const theme = useTheme()
  const [statuses, setStatuses] = useState<Record<string, boolean>>({})
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' })

  const checkPermissions = useCallback(async () => {
    const results: Record<string, boolean> = {}
    for (const item of PERMISSIONS) {
      try {
        const granted = await PermissionsAndroid.check(item.permission)
        results[item.permission] = granted
      } catch {
        results[item.permission] = false
      }
    }
    setStatuses(results)
  }, [])

  useEffect(() => {
    checkPermissions()
  }, [checkPermissions])

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message })
  }

  const onPermissionPress = async (item: PermissionItem) => {
    if (Platform.OS !== 'android') {
      showSnackbar('请前往系统设置开启')
      return
    }

    if (!item.dangerous) {
      try {
        const granted = await PermissionsAndroid.request(item.permission)
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          showSnackbar(`${item.name}无需申请`)
        }
      } catch {
        showSnackbar(`${item.name}请求失败`)
      }
      await checkPermissions()
      return
    }

    try {
      const granted = await PermissionsAndroid.request(item.permission)
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        showSnackbar(`${item.name}权限已授权`)
      } else {
        showSnackbar(`${item.name}权限被拒绝`)
      }
    } catch {
      showSnackbar(`${item.name}权限请求失败`)
    }
    await checkPermissions()
  }

  const isGranted = (permission: string) => statuses[permission] === true

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
          以下为应用运行所需的系统权限，点击可申请授权
        </Text>

        <List.Section style={[styles.listSection, { backgroundColor: theme.colors.surfaceVariant }]}>
          {PERMISSIONS.map((item, index) => (
            <List.Item
              key={index}
              title={item.name}
              description={item.description}
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon={item.icon} />}
              right={props =>
                isGranted(item.permission) ? (
                  <Chip style={styles.chip} textStyle={{ fontSize: 12 }} mode="flat">
                    已授权
                  </Chip>
                ) : (
                  <List.Icon {...props} icon="chevron-right" />
                )
              }
              onPress={() => onPermissionPress(item)}
            />
          ))}
        </List.Section>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
        action={{
          label: '确定',
          onPress: () => setSnackbar(prev => ({ ...prev, visible: false })),
        }}>
        {snackbar.message}
      </Snackbar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  listSection: {
    borderRadius: 12,
  },
  chip: {
    alignSelf: 'center',
  },
})
