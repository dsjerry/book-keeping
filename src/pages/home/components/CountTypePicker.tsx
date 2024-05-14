import React from 'react'
import WheelPicker from 'react-native-wheely'

import { CountTypeList } from '~consts/Data'

export function CountTypePicker({ index, setIndex }: Props) {
  return (
    <WheelPicker
      selectedIndex={index}
      options={CountTypeList}
      onChange={index => setIndex(index)}
      selectedIndicatorStyle={{ backgroundColor: '#e8e1ed' }}
      containerStyle={{
        flex: 1,
        marginLeft: 10,
      }}
      itemTextStyle={{ color: '#6b4faa' }}
    />
  )
}

interface Props {
  index: number
  setIndex: (index: number) => void
}
