import { useEffect, useState } from 'react'
import { View, Platform } from 'react-native'
import Geolocation from '@react-native-community/geolocation'
import { AMapSdk, MapView, MapType } from 'react-native-amap3d'

/**
 * TODO: 会导致闪退
 */

const Map = () => {
  const [position, setPosition] = useState({
    latitude: 39.993282,
    longitude: 116.473195,
  })
  useEffect(() => {
    AMapSdk.init(
      Platform.select({
        android: '42e1bd55d254d5900eb66c8da98ee3fb',
      }),
    )
    Geolocation.getCurrentPosition(position => {
      setPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    })
  })

  return (
    <View style={{ width: '100%' }}>
      <MapView
        style={{ width: '100%', height: 300 }}
        mapType={MapType.Bus}
        initialCameraPosition={{
          target: {
            latitude: position.latitude,
            longitude: position.longitude,
          },
          zoom: 15,
        }}
        onLoad={() => console.log('onLoad')}
        onPress={({ nativeEvent }) => console.log(nativeEvent)}
        onCameraIdle={({ nativeEvent }) => console.log(nativeEvent)}
      />
    </View>
  )
}

export default Map
