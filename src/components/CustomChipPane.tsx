import { View, StyleSheet } from 'react-native'
import { Chip, Icon, useTheme } from 'react-native-paper'

interface ChipItem {
  id: string
  name: string
  icon: string
  alias: string
  isChecked: boolean
  color?: string
}
interface Props {
  items: ChipItem[]
  onPress: (item: ChipItem) => void
  onLongPress?: (item: ChipItem) => void
}

const CustomChipPane: React.FC<Props> = ({ items, onPress, onLongPress }) => {
  const theme = useTheme()
  const paneWidth = items.length > 1 ? '100%' : 'auto'

  return (
    <View style={[style.pane, { width: paneWidth }]}>
      {items.map(item => {
        const iconColor = (
          item.color ? theme.colors[item.color as keyof typeof theme.colors] : theme.colors.onSurfaceVariant
        ) as string
        return (
          <Chip
            selected={item.isChecked}
            showSelectedOverlay
            key={item.id}
            style={style.chip}
            icon={({ size }) => <Icon source={item.icon} size={size} color={iconColor} />}
            mode="outlined"
            onPress={() => onPress(item)}
            onLongPress={onLongPress ? () => onLongPress(item) : undefined}>
            {item.name}
          </Chip>
        )
      })}
    </View>
  )
}

const style = StyleSheet.create({
  pane: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  chip: {
    marginRight: 5,
    marginTop: 5,
  },
})

export default CustomChipPane
