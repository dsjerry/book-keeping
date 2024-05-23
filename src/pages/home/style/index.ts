import { StyleSheet } from 'react-native'

export const layout = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    flex: 1,
    width: '90%',
    height: 300,
    elevation: 5,
    paddingHorizontal: 10,
    paddingTop: 10,
    borderRadius: 5,
  },
  detail: {
    flex: 2,
    width: '90%',
  },
  cardHeader: {
    flex: 1,
  },
  cardBody: {
    flex: 3,
  },
  cardFooter: {
    flex: 1,
    justifyContent: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    height: 50,
    paddingHorizontal: 20,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export const fontStyle = StyleSheet.create({
  no: {
    marginLeft: 'auto',
    color: '#e7e0ec',
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 15,
    color: '#ffffff',
    marginVertical: 5,
  },
  amount: {
    fontSize: 35,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footerItem: {
    marginLeft: 4,
    color: '#6750a4',
    fontWeight: 'bold',
    fontSize: 14,
  },
})

export const chipPane = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
  chip: {
    transform: [{ scale: 0.8 }],
  },
})

export const detailCard = StyleSheet.create({})

export const homeStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#e7e0ec',
  },
  btnArea: {
    position: 'absolute',
    bottom: 20,
  },
})
