import color from 'color'

/**
 * 给任意颜色附加透明度，返回 rgba 字符串。
 *
 * 说明：react-native-paper 5.x 的 MD3 主题色都是 `rgba(r, g, b, 1)` 格式，
 * 不能直接字符串拼接 hex 透明度后缀（如 `theme.colors.primary + '80'` 会得到
 * `rgba(103, 80, 164, 1)80` 这样的非法颜色）。统一用 color 库解析并叠加透明度。
 */
export const withAlpha = (value: string, alpha: number): string => color(value).alpha(alpha).rgb().string()
