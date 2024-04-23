import { Button } from 'react-native-paper'

interface Props {
  onPress: () => void
}

const AddingButton: React.FC<Props> = ({ onPress }) => {
  return (
    <Button
      icon={'plus-box'}
      mode="contained"
      buttonColor="#05a5d1"
      onPress={onPress}>
      记一笔
    </Button>
  )
}

export default AddingButton
