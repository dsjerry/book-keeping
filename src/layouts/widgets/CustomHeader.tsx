import { Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackHeaderProps } from '@react-navigation/stack'
import { HeaderTitle, HeaderBackButton } from '@react-navigation/elements'
import { Icon } from 'react-native-paper'

interface CustomHeaderProps extends StackHeaderProps {}

export const CustomHeaderWithTitle: React.FC<CustomHeaderProps> = ({
  navigation,
  options,
}) => {
  return (
    <Pressable
      style={{
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}>
      <HeaderBackButton
        backImage={() => (
          <Icon source={'chevron-left'} size={24} color="#6b4faa" />
        )}
        onPress={() => navigation.goBack()}
      />
      <HeaderTitle
        style={{
          fontSize: 16,
          marginRight: 'auto',
          marginTop: -2,
          color: '#6b4faa',
        }}>
        {options.title}
      </HeaderTitle>
    </Pressable>
  )
}
