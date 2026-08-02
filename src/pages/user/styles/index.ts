import { StyleSheet } from 'react-native'

export const loginStyle = StyleSheet.create({
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  tagline: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  formPane: {
    width: '100%',
    alignItems: 'center',
  },
  inputPane: {
    width: '100%',
    marginBottom: 4,
  },
  helperText: {
    marginTop: -4,
  },
  submitPane: {
    width: '100%',
    marginTop: 8,
  },
  submitBtn: {
    width: '100%',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  checkboxLabel: {
    fontSize: 12,
    marginLeft: 4,
  },
})
