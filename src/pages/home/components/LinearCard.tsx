import { View, Text } from 'react-native'
import { Chip, Icon } from 'react-native-paper'
import LinearGradient from 'react-native-linear-gradient'

import { layout, fontStyle, chipPane } from '../style'

const LinearCard = () => {
  return (
    <LinearGradient
      colors={['#6750a4', '#a89ac7', '#e7e0ec']}
      style={layout.card}>
      <View style={layout.cardHeader}>
        <Text style={fontStyle.no}>{'No.1'}</Text>
      </View>
      <View style={layout.cardBody}>
        <View style={layout.count}>
          <Text style={fontStyle.desc}>
            金额 <Text style={fontStyle.amount}>10</Text> 元 {'人民币'}
          </Text>
        </View>
        <View style={chipPane.container}>
          <Chip icon={'home'} mode="flat" style={chipPane.chip}>
            {'购物'}
          </Chip>
        </View>
      </View>
      <View style={layout.cardFooter}>
        <View style={layout.footerItem}>
          <Icon size={20} source={'calendar'} color="#6750a4"></Icon>
          <Text style={fontStyle.footerItem}>{'2020-12-12'}</Text>
        </View>
      </View>
    </LinearGradient>
  )
}

export default LinearCard
