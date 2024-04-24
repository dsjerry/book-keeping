import { Button } from 'react-native-paper'

interface Props {
  onPress: () => void
}

const AddingButton: React.FC<Props> = ({ onPress }) => {
  return (
    <Button
      icon={'plus-box'}
      mode="contained"
      buttonColor="#6d57a7"
      onPress={onPress}>
      记一笔
    </Button>
  )
}

export { AddingButton }
