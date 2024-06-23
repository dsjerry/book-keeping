import { Dimensions } from 'react-native'

export const DEVICE_WIDTH = Dimensions.get('window').width

export const OutTypes = [
  {
    id: '1',
    name: '餐饮',
    alias: 'food',
    icon: 'food-outline',
    isChecked: false,
  },
  {
    id: '2',
    name: '购物',
    alias: 'shop',
    icon: 'cart',
    isChecked: false,
  },
  {
    id: '3',
    name: '交通',
    alias: 'traffic',
    icon: 'car',
    isChecked: false,
  },
  {
    id: '4',
    name: '通讯',
    alias: 'communication',
    icon: 'phone',
    isChecked: false,
  },
  {
    id: '5',
    name: '娱乐',
    alias: 'entertainment',
    icon: 'gamepad',
    isChecked: false,
  },
]

export const CountTypeList = ['人民币', '港币', '澳元']

export const CountTypeWithIconList = [
  {
    id: '1',
    name: '人民币',
    alias: 'cny',
    icon: 'currency-cny',
    isChecked: false,
  },
  {
    id: '2',
    name: '港币',
    alias: 'hkd',
    icon: 'currency-usd',
    isChecked: false,
  },
  {
    id: '3',
    name: '澳元',
    alias: 'aud',
    icon: 'currency-usd',
    isChecked: false,
  },
]

export enum CountType {
  人民币 = 'cny',
  港币 = 'hkd',
  澳元 = 'aud',
}
