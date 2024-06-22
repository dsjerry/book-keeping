import { RouteProp, ParamListBase } from '@react-navigation/native'

declare global {
  interface ScreenParamsList extends ParamListBase {
    Detail: {
      id: string
    }
    HomeScreen: {}
    Adding: {
      isEdit?: boolean
      item?: KeepingItem
      address?: NearByItem
    }
    User: {}
    LoginScreen: {}
    UserHomeScreen: {
      user?: Partial<User>
    }
    ProfileEditScreen: {}
    DetailScreen: {
      id: KeepingItem['id']
      hideHeader?: boolean
    }
    SettingsScreen: {}
    AnalyzeScreen: {}
    AboutScreen: {}
    AddTagsScreen: {}
  }
  /**
   * 导航参数
   */
  namespace ScreenParam {
    type Detail = RouteProp<ScreenParamsList, 'Detail'>
    type Home = RouteProp<ScreenParamsList, 'Home'>
    type Adding = RouteProp<ScreenParamsList, 'Adding'>
    type User = RouteProp<ScreenParamsList, 'UserHomeScreen'>
  }
  // 在这里扩展导航参数
  namespace ReactNavigation {
    interface RootParamList extends ScreenParamsList {}
  }
}
