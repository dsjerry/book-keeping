import { StyleSheet } from 'react-native'

export const loginStyle = StyleSheet.create({
  container: {
    height: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#e7e0ec',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6750a4',
  },
  formPane: {
    width: '90%',
    height: '50%',
    // minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitPane: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    width: '90%',
    marginHorizontal: 'auto',
    borderRadius: 4,
  },
  inputPane: {
    width: '90%',
    borderRadius: 4,
  },
})
