import { Button, useTheme } from 'react-native-paper'

interface Props {
  onPress: () => void
}

const AddingButton: React.FC<Props> = ({ onPress }) => {
  const theme = useTheme()
  return (
    <Button
      icon={'keyboard-outline'}
      mode="contained-tonal"
      onPress={onPress}
      style={{ borderRadius: 12, width: '100%' }}
      contentStyle={{ paddingVertical: 4 }}>
      记一笔
    </Button>
  )
}

export { AddingButton }
