import React from 'react'
import WheelPicker from 'react-native-wheely'
import { useTheme } from 'react-native-paper'

import { CountTypeList } from '~consts/Data'

export function CountTypePicker({ index, setIndex }: Props) {
  const theme = useTheme()
  return (
    <WheelPicker
      selectedIndex={index}
      options={CountTypeList}
      onChange={index => setIndex(index)}
      selectedIndicatorStyle={{ backgroundColor: theme.colors.background }}
      containerStyle={{
        flex: 1,
        marginLeft: 10,
      }}
      itemTextStyle={{ color: theme.colors.onBackground }}
    />
  )
}

interface Props {
  index: number
  setIndex: (index: number) => void
}
