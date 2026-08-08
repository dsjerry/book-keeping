import { useEffect, useRef, useState, useCallback } from 'react'
import type { ComponentRef } from 'react'
import { FlatList, View, Pressable, StyleSheet } from 'react-native'
import { Text, TextInput, RadioButton, useTheme } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import Geolocation from '@react-native-community/geolocation'
import { WebView } from 'react-native-webview'
import Config from 'react-native-config'
import axios from 'axios'

import { Amap, logging, withAlpha, wgs84ToGcj02 } from '~utils'
import { useHomeStoreDispatch } from './contexts/HomeContext'
import LoadingIndicator from '~components/LoadingIndicator'

/**
 * 地址选择页：
 * - WebView 加载高德 JSAPI v2.0（WebGL 最新地图）+ 当前位置 Marker + 点击选点
 * - 下方搜索栏 + 附近地址列表
 */

const buildMapHtml = (key: string, securityCode: string, initLng: number, initLat: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://webapi.amap.com/loader.js"></script>
  <style>html,body,#container{margin:0;width:100%;height:100%;overflow:hidden}</style>
</head>
<body>
  <div id="container"></div>
  <script>
    window._AMapSecurityConfig = { securityJsCode: '${securityCode}' }
    AMapLoader.load({ key: '${key}', version: '2.0', plugins: ['AMap.Geocoder'] })
      .then(function (AMap) {
        AMap.getConfig().appname = 'amap-jsapi-skill'
        var map = new AMap.Map('container', {
          zoom: 15,
          center: [${initLng}, ${initLat}],
          viewMode: '2D',
        })
        window.__map = map
        window.__pendingMarker = null
        var marker = null

        // 点击选点
        map.on('click', function (e) {
          var lnglat = e.lnglat
          if (marker) { map.remove(marker) }
          marker = new AMap.Marker({
            position: lnglat,
            content: '<div style="width:14px;height:14px;background:#E74C3C;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
            offset: new AMap.Pixel(-7, -7),
          })
          map.add(marker)
          var geocoder = new AMap.Geocoder()
          geocoder.getAddress(lnglat, function (status, result) {
            if (status === 'complete' && result.regeocode) {
              var addr = result.regeocode.formattedAddress || ''
              var pois = result.regeocode.pois || []
              var name = pois.length > 0 ? pois[0].name : addr
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lnglat.lat, lng: lnglat.lng, name: name, address: addr }))
              }
            }
          })
        })

        window.__moveTo = function (lng, lat) { map.setCenter([lng, lat]) }

        window.__addMarker = function (lng, lat, title) {
          if (!window.__map) {
            window.__pendingMarker = { lng: lng, lat: lat, title: title || '' }
            return
          }
          if (marker) { map.remove(marker) }
          marker = new AMap.Marker({
            position: [lng, lat],
            title: title || '',
            content: '<div style="width:14px;height:14px;background:#E74C3C;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
            offset: new AMap.Pixel(-7, -7),
          })
          map.add(marker)
        }

        window.__selectResult = function (lng, lat, name) {
          map.setZoomAndCenter(16, [lng, lat])
          if (marker) { map.remove(marker) }
          marker = new AMap.Marker({
            position: [lng, lat],
            title: name,
            content: '<div style="width:14px;height:14px;background:#E74C3C;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
            offset: new AMap.Pixel(-7, -7),
          })
          map.add(marker)
        }

        if (window.__pendingMarker) {
          var pm = window.__pendingMarker
          window.__addMarker(pm.lng, pm.lat, pm.title)
          window.__pendingMarker = null
        }
      })
      .catch(function (e) { console.error('AMap load error', e) })
  </script>
</body>
</html>
`

const AddressList = () => {
  const theme = useTheme()
  const [nearBy, setNearBy] = useState<NearByItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadMsg, setLoadMsg] = useState('')
  const [mapCenter, setMapCenter] = useState<{ lng: number; lat: number } | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<NearByItem | null>(null)
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<{ name: string; address: string; lng: number; lat: number }[]>([])
  const [showSearch, setShowSearch] = useState(false)

  const dispatch = useHomeStoreDispatch()
  const navigation = useNavigation()
  const webViewRef = useRef<ComponentRef<typeof WebView>>(null)
  const jsapiKey = Config.AMAP_JSAPI_KEY || ''
  const jsapiSecurityCode = Config.AMAP_JSAPI_SECURITY_CODE || ''

  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    })
    Geolocation.getCurrentPosition(position => {
      const center = wgs84ToGcj02(position.coords.latitude, position.coords.longitude)
      setMapCenter({ lng: center.longitude, lat: center.latitude })
      webViewRef.current?.injectJavaScript(
        `window.__moveTo && window.__moveTo(${center.longitude}, ${center.latitude});
         window.__addMarker && window.__addMarker(${center.longitude}, ${center.latitude}, '当前位置');`,
      )
      const amap = new Amap({ latitude: position.coords.latitude, longitude: position.coords.longitude })
      amap
        .regeo()
        .then((res: any) => {
          setNearBy((res?.regeocode?.pois ?? []) as NearByItem[])
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

  const onWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data?.address) {
        setSelectedAddress({
          name: data.name || data.address,
          address: data.address,
          location: `${data.lng},${data.lat}`,
        } as NearByItem)
      }
    } catch (error) { logging.error('[地图] WebView 消息解析失败:', error) }
  }

  const handleSearch = useCallback(async () => {
    const keyword = searchText.trim()
    if (!keyword) return
    try {
      // 构建搜索参数，添加当前位置信息以限制搜索范围
      const params: Record<string, string> = {
        key: Config.AMAP_API_KEY || '',
        keywords: keyword,
        output: 'json',
      }

      // 如果有当前位置，添加 location 参数进行附近搜索
      if (mapCenter) {
        params.location = `${mapCenter.lng},${mapCenter.lat}`
        params.radius = '5000' // 搜索半径 5 公里
        params.sortrule = 'distance' // 按距离排序
      }

      const { data } = await axios.get('https://restapi.amap.com/v3/place/text', { params })
      if (data.status === '1') {
        setSearchResults(
          (data.pois || []).map((poi: any) => ({
            name: poi.name,
            address: poi.address || poi.cityname || '',
            lng: parseFloat(poi.location.split(',')[0]),
            lat: parseFloat(poi.location.split(',')[1]),
          })),
        )
        setShowSearch(true)
      } else {
        setSearchResults([])
        setShowSearch(true)
      }
    } catch (error) {
      logging.error('[搜索] 地点搜索失败:', error)
    }
  }, [searchText, mapCenter])

  const handleSelectResult = useCallback((item: { name: string; address: string; lng: number; lat: number }) => {
    webViewRef.current?.injectJavaScript(
      `window.__selectResult && window.__selectResult(${item.lng}, ${item.lat}, '${item.name.replace(/'/g, "\\'")}');`,
    )
    setSelectedAddress({ name: item.name, address: item.address, location: `${item.lng},${item.lat}` } as NearByItem)
    setSearchResults([])
    setShowSearch(false)
  }, [])

  return (
    <View style={[addrStyle.container, { backgroundColor: theme.colors.background }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{
          html: buildMapHtml(jsapiKey, jsapiSecurityCode, mapCenter?.lng ?? 116.397428, mapCenter?.lat ?? 39.90923),
        }}
        style={addrStyle.map}
        onMessage={onWebViewMessage}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        renderLoading={() => (
          <View
            style={{
              width: '100%',
              height: 260,
              backgroundColor: '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{ color: '#999' }}>地图加载中...</Text>
          </View>
        )}
      />
      {selectedAddress && (
        <Pressable
          onPress={() => onAddressSelect(selectedAddress)}
          style={({ pressed }) => [
            addrStyle.confirmBtn,
            { backgroundColor: pressed ? withAlpha(theme.colors.primary, 0.9) : theme.colors.primary },
          ]}>
          <Text style={[addrStyle.confirmText, { color: theme.colors.onPrimary }]}>
            使用该位置：{selectedAddress.name}
          </Text>
        </Pressable>
      )}
      <View style={addrStyle.searchRow}>
        <TextInput
          mode="outlined"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          placeholder="搜索地点..."
          dense
          style={addrStyle.searchInput}
          outlineStyle={{ borderRadius: 12 }}
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchText ? (
              <TextInput.Icon
                icon="close"
                onPress={() => {
                  setSearchText('')
                  setSearchResults([])
                  setShowSearch(false)
                }}
              />
            ) : undefined
          }
        />
        <Pressable
          onPress={handleSearch}
          style={({ pressed }) => [
            addrStyle.searchBtn,
            { backgroundColor: pressed ? withAlpha(theme.colors.primary, 0.9) : theme.colors.primary },
          ]}>
          <Text style={{ color: theme.colors.onPrimary, fontWeight: '600', fontSize: 14 }}>搜索</Text>
        </Pressable>
      </View>
      {showSearch && (
        <FlatList
          data={searchResults}
          keyExtractor={(_, i) => String(i)}
          style={addrStyle.searchResults}
          ListEmptyComponent={<Text style={{ color: theme.colors.onSurfaceVariant, padding: 16 }}>无搜索结果</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectResult(item)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? withAlpha(theme.colors.primary, 0.1) : 'transparent',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.colors.outlineVariant,
              })}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}>{item.address}</Text>
            </Pressable>
          )}
        />
      )}
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
        keyExtractor={(_, i) => String(i)}
        style={{ flex: 1 }}
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
  container: { flex: 1 },
  map: { width: '100%', height: 260 },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  confirmText: { fontSize: 14, fontWeight: '600' },
  searchRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, borderRadius: 12 },
  searchBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  searchResults: { maxHeight: 200, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e0e0e0' },
  noLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noLocationText: { marginLeft: 'auto', marginRight: 20, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15 },
  listContent: { paddingBottom: 20 },
  addressName: { fontWeight: 'bold', marginBottom: 4 },
  addressDetail: { fontSize: 13 },
})

export default AddressList
