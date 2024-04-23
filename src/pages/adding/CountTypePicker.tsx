import React from 'react'
import WheelPicker from 'react-native-wheely'

import { useAdding } from './hooks/useAdding'
import { CountTypeList } from 'consts/Data'

export default function CountTypePicker() {
  const { countTypeIndex, setCountTypeIndex } = useAdding()
  return (
    <WheelPicker
      selectedIndex={countTypeIndex}
      options={CountTypeList}
      onChange={index => setCountTypeIndex(index)}
      selectedIndicatorStyle={{ backgroundColor: '#e8e1ed' }}
      containerStyle={{
        flex: 1,
        marginLeft: 10,
      }}
      itemTextStyle={{ color: '#6b4faa' }}
    />
  )
}
