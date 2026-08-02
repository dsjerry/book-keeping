declare module 'react-native-config' {
  export interface NativeConfig {
    APP_NAME?: string
    AUTHOR?: string
    AUTHOR_AKA?: string
    EMAIL?: string
    SITE?: string
    API_URL?: string
    APP_VERSION?: string
    DEEPSEEK_API_KEY?: string
    AMAP_API_KEY?: string
    AMAP_ANDROID_KEY?: string
    AMAP_JSAPI_KEY?: string
    AMAP_JSAPI_SECURITY_CODE?: string
    COORD_SYSTEM?: string
  }

  export const Config: NativeConfig
  export default Config
}
