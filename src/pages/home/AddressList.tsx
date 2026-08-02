import { useEffect, useState } from 'react'
import { FlatList, View, Pressable, StyleSheet } from 'react-native'
import { Text, RadioButton, useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import Geolocation from '@react-native-community/geolocation'

import { Amap, logging, withAlpha } from '~utils'
import { useHomeStoreDispatch } from './contexts/HomeContext'
import LoadingIndicator from '~components/LoadingIndicator'

/**
 * 根据经纬度获取详细地址
 * https://lbs.amap.com/api/webservice/guide/api/georegeo#regeo
 */

const AddressList = () => {
  const theme = useTheme()
  const [nearBy, setNearBy] = useState<NearByItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadMsg, setLoadMsg] = useState('')

  const dispatch = useHomeStoreDispatch()
  const navigation = useNavigation()

  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    })
    Geolocation.getCurrentPosition(position => {
      const amap = new Amap({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      amap
        .regeo()
        .then((res: any) => {
          // 高德响应可能缺少 regeocode（如 key 失效），防御处理避免崩溃
          const pois = res?.regeocode?.pois ?? []
          setNearBy(pois as NearByItem[])
        })
        .catch((err: any) => {
          logging.error('[地址] 获取详细地址失败!', err)
          setLoadMsg('加载失败!')
        })
        .finally(() => {
          if (nearBy.length > 0) return setLoading(false)
          setTimeout(() => setLoading(false), 1500)
        })
    })
  }, [])

  const onAddressSelect = (item?: NearByItem) => {
    dispatch({ type: 'addForm', payload: { address: item } })
    navigation.goBack()
  }

  return (
    <View style={[addrStyle.container, { backgroundColor: theme.colors.background }]}>
      <Pressable
        onPress={() => onAddressSelect()}
        style={[addrStyle.noLocationRow, { borderBottomColor: theme.colors.outlineVariant }]}>
        <RadioButton value="nearby" status="checked" />
        <Text style={[addrStyle.noLocationText, { color: theme.colors.primary }]}>不使用位置</Text>
      </Pressable>
      <LoadingIndicator
        animating={loading}
        text={loadMsg}
        indicatorBoxStyle={{ backgroundColor: theme.colors.background }}
      />
      {nearBy.length === 0 && !loading && (
        <View style={addrStyle.emptyState}>
          <Text style={[addrStyle.emptyText, { color: theme.colors.onSurfaceVariant }]}>地址获取失败</Text>
        </View>
      )}
      <FlatList
        data={nearBy}
        keyExtractor={(_item, index) => String(index)}
        contentContainerStyle={addrStyle.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onAddressSelect(item)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? withAlpha(theme.colors.primary, 0.1) : 'transparent',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: theme.colors.outlineVariant,
            })}>
            <View>
              <Text style={[addrStyle.addressName, { color: theme.colors.primary }]}>{item.name}</Text>
              <Text style={[addrStyle.addressDetail, { color: theme.colors.onSurfaceVariant }]}>{item.address}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  )
}

const addrStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  noLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noLocationText: {
    marginLeft: 'auto',
    marginRight: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  addressName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 13,
  },
})

export default AddressList
