import { Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackHeaderProps } from '@react-navigation/stack'
import { HeaderTitle, HeaderBackButton } from '@react-navigation/elements'
import { Icon, useTheme } from 'react-native-paper'

interface CustomHeaderProps extends StackHeaderProps {}

export const CustomHeaderWithTitle: React.FC<CustomHeaderProps> = ({ navigation, options }) => {
  const insets = useSafeAreaInsets()
  const theme = useTheme()

  return (
    <Pressable
      style={[
        style.container,
        {
          marginTop: insets.top,
          backgroundColor: theme.colors.elevation.level5,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}>
      <HeaderBackButton
        backImage={() => <Icon source={'chevron-left'} size={24} color={theme.colors.primary} />}
        onPress={() => navigation.goBack()}
      />
      <HeaderTitle
        style={{
          fontSize: 16,
          marginRight: 'auto',
          color: theme.colors.primary,
        }}>
        {options.title}
      </HeaderTitle>
    </Pressable>
  )
}

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
})
