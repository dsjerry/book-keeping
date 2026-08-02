import { StyleSheet } from 'react-native'

export const layout = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  // 这里的样式影响分享的样式
  sharepane: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  detail: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardBody: {},
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
})

export const homeStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  btnArea: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
})
