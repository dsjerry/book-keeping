import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Chip, Icon, useTheme } from 'react-native-paper'
import LinearGradient from 'react-native-linear-gradient'
import dayjs from 'dayjs'

import { layout } from '../style'
import { withAlpha } from '~utils'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const LinearCard: React.FC<Props> = ({ item }) => {
  const theme = useTheme()
  const isIncome = item.type === 'in'

  const gradientColors = [theme.colors.primary, withAlpha(theme.colors.primary, 0.8)]

  return (
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={layout.card}>
      {/* Decorative circle */}
      <View
        style={[
          deco.circle,
          {
            backgroundColor: withAlpha(theme.colors.onPrimary, 0.06),
            borderColor: withAlpha(theme.colors.onPrimary, 0.03),
          },
        ]}
      />
      <View style={[deco.circleSmall, { backgroundColor: withAlpha(theme.colors.onPrimary, 0.03) }]} />

      {/* Header: type badge + No. */}
      <View style={layout.cardHeader}>
        <View
          style={[
            typeBadge.container,
            {
              backgroundColor: withAlpha(theme.colors.onPrimary, 0.1),
            },
          ]}>
          <Icon source={isIncome ? 'arrow-down' : 'arrow-up'} size={12} color={theme.colors.onPrimary} />
          <Text style={[typeBadge.text, { color: theme.colors.onPrimary }]}>{isIncome ? '收入' : '支出'}</Text>
        </View>
        <Text style={[cardText.no, { color: withAlpha(theme.colors.onPrimary, 0.8) }]}>{'No.' + item.no}</Text>
      </View>

      {/* Amount section */}
      <View style={amountSection.container}>
        <Text style={[cardText.amount, { color: theme.colors.onPrimary }]}>{item.count}</Text>
        <Text style={[cardText.currency, { color: withAlpha(theme.colors.onPrimary, 0.7) }]}>{item.countType}</Text>
      </View>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={chipPane.container}>
          {item.tags.map(tag => (
            <Chip
              key={tag.id}
              icon={({ size }) => <Icon source={tag.icon} size={size} color={theme.colors.onPrimary} />}
              mode="flat"
              compact
              textStyle={{ color: theme.colors.onPrimary, fontSize: 12 }}
              style={[chipPane.chip, { backgroundColor: withAlpha(theme.colors.onPrimary, 0.1) }]}>
              {tag.name}
            </Chip>
          ))}
        </View>
      )}

      {/* Footer: date */}
      <View style={layout.cardFooter}>
        <View style={layout.footerItem}>
          <Icon size={16} source={'calendar'} color={withAlpha(theme.colors.onPrimary, 0.7)} />
          <Text style={[cardText.footerItem, { color: withAlpha(theme.colors.onPrimary, 0.7) }]}>
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

const DECO_CIRCLE_SIZE = SCREEN_WIDTH * 0.55
const DECO_CIRCLE_SMALL = SCREEN_WIDTH * 0.28

const cardText = StyleSheet.create({
  no: {
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
    includeFontPadding: false,
  },
  currency: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  footerItem: {
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 13,
  },
})

const typeBadge = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})

const amountSection = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
})

const chipPane = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    borderRadius: 100,
    height: 28,
  },
})

const deco = StyleSheet.create({
  circle: {
    position: 'absolute',
    top: -DECO_CIRCLE_SIZE * 0.35,
    right: -DECO_CIRCLE_SIZE * 0.25,
    width: DECO_CIRCLE_SIZE,
    height: DECO_CIRCLE_SIZE,
    borderRadius: DECO_CIRCLE_SIZE / 2,
    borderWidth: 1,
  },
  circleSmall: {
    position: 'absolute',
    top: DECO_CIRCLE_SIZE * 0.15,
    right: DECO_CIRCLE_SIZE * 0.5,
    width: DECO_CIRCLE_SMALL,
    height: DECO_CIRCLE_SMALL,
    borderRadius: DECO_CIRCLE_SMALL / 2,
  },
})

export default LinearCard
