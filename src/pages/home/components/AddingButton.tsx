import { Button } from 'react-native-paper'

interface Props {
  onPress: () => void
}

const AddingButton: React.FC<Props> = ({ onPress }) => {
  return (
    <Button icon={'keyboard-outline'} mode="elevated" onPress={onPress}>
      记一笔
    </Button>
  )
}

export { AddingButton }
