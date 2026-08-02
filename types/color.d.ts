/**
 * color 库的最小类型声明（react-native-paper 的传递依赖，无 @types/color）。
 * 仅声明项目实际用到的 API。
 */
declare module 'color' {
  interface ColorInstance {
    alpha(value: number): ColorInstance
    rgb(): ColorInstance
    string(): string
  }

  interface ColorConstructor {
    (value: string | { r: number; g: number; b: number; a?: number }): ColorInstance
  }

  const color: ColorConstructor
  export default color
}
