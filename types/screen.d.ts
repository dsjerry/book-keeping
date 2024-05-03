import { RouteProp } from '@react-navigation/native'

declare global {
  namespace ScreenParam {
    type Detail = RouteProp<ScreenParamsList, 'Detail'>
    type Home = RouteProp<ScreenParamsList, 'Home'>
    type Adding = RouteProp<ScreenParamsList, 'Adding'>
  }
}

interface ScreenParamsList {
  Detail: {
    id: string
  }
  Home: {
    text: string
  }
  Adding: {
    isEdit: boolean
    item: KeepingItem
  }
}
