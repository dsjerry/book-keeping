import { View } from 'react-native'
import { Dialog } from '@rneui/themed'

import { _COLORS } from '~consts/Colors'

interface Props {
  title?: string
  indicator?: boolean
  width?: number
  children?: React.ReactNode
  onBackdropPress: () => void
}

const CustomDialog: React.FC<Props> = ({
  title,
  indicator,
  width = 200,
  children,
  onBackdropPress,
}) => {
  return (
    <Dialog
      overlayStyle={{
        width: width,
        transform: [{ translateY: -50 }],
      }}
      onBackdropPress={onBackdropPress}>
      {/* loading 动画 */}
      {indicator !== false ? (
        <Dialog.Loading loadingProps={{ size: 'large', color: _COLORS.main }} />
      ) : null}
      {/* 显示插槽或者标题 */}
      {children ? (
        children
      ) : (
        <Dialog.Title
          title={title ? title : ''}
          titleStyle={{ textAlign: 'center', color: _COLORS.main_50 }}
        />
      )}
    </Dialog>
  )
}

export default CustomDialog
