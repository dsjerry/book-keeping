import { useEffect, useState } from 'react'
import { FlatList, View, Pressable } from 'react-native'
import { Text, RadioButton } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import Geolocation from '@react-native-community/geolocation'

import { _COLORS } from '~consts/Colors'
import { Amap } from '~utils'
import { useHomeStoreDispatch } from './contexts/HomeContext'

/**
 * 根据经纬度获取详细地址
 * https://lbs.amap.com/api/webservice/guide/api/georegeo#regeo
 */

const AddressList = () => {
  const [nearBy, setNearBy] = useState<NearByItem[]>([])

  const dispatch = useHomeStoreDispatch()
  const navigation = useNavigation()

  useEffect(() => {
    Geolocation.getCurrentPosition(position => {
      const amap = new Amap({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      amap
        .regeo()
        .then((res: any) => {
          const _addr = res.regeocode.pois as NearByItem[]
          setNearBy(_addr)
        })
        .catch((err: any) => {
          console.error('获取详细地址失败!', err)
        })
    })
  }, [])

  const onAddressSelect = (item?: NearByItem) => {
    dispatch({ type: 'addForm', payload: { address: item } })
    navigation.goBack()
  }

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={() => onAddressSelect()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 10,
          height: 50,
        }}>
        <RadioButton value="nearby" status="checked" />
        <Text
          style={{
            marginLeft: 'auto',
            marginRight: 20,
            color: _COLORS.main,
            fontWeight: 'bold',
          }}>
          不使用位置
        </Text>
      </Pressable>
      <FlatList
        data={nearBy}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onAddressSelect(item)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? _COLORS.main_10 : 'transparent',
              paddingHorizontal: 20,
              paddingVertical: 18,
              borderBottomWidth: 0.2,
              borderBottomColor: _COLORS.main_20,
            })}>
            <View>
              <Text
                style={{
                  color: _COLORS.main,
                  fontWeight: 'bold',
                  marginBottom: 5,
                }}>
                {item.name}
              </Text>
              <Text style={{ color: _COLORS.main_50 }}>{item.address}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  )
}

export default AddressList
