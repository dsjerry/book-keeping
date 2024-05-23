declare module 'react-native-config' {
  export interface NativeConfig {
    APP_NAME?: string
    AUTHOR?: string
    AUTHOR_AKA?: string
    EMAIL?: string
    SITE?: string
  }

  export const Config: NativeConfig
  export default Config
}
