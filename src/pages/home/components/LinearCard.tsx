import { View, Text } from 'react-native'
import { Chip, Icon } from 'react-native-paper'
import LinearGradient from 'react-native-linear-gradient'
import dayjs from 'dayjs'

import { layout, fontStyle, chipPane } from '../style'

const LinearCard: React.FC<Props> = ({ item }) => {
  return (
    <LinearGradient
      colors={['#6750a4', '#a89ac7', '#e7e0ec']}
      style={layout.card}>
      <View style={layout.cardHeader}>
        <Text style={fontStyle.no}>{'No.' + item.no}</Text>
      </View>
      <View style={layout.cardBody}>
        <View style={layout.count}>
          <Text style={fontStyle.desc}>
            金额 <Text style={fontStyle.amount}>{item.count}</Text> 元{' '}
            {item.countType}
          </Text>
        </View>
        <View style={chipPane.container}>
          {item.tags?.map(tag => (
            <Chip
              key={tag.id}
              icon={tag.icon}
              mode="flat"
              style={chipPane.chip}>
              {tag.name}
            </Chip>
          ))}
        </View>
      </View>
      <View style={layout.cardFooter}>
        <View style={layout.footerItem}>
          <Icon size={20} source={'calendar'} color="#6750a4"></Icon>
          <Text style={fontStyle.footerItem}>
            {dayjs(item.date).format('YYYY-MM-DD')}
          </Text>
        </View>
      </View>
    </LinearGradient>
  )
}

interface Props {
  item: Partial<KeepingItem>
}

export default LinearCard
