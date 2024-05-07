import dayjs from 'dayjs'

/**
 * 不同年：年月日 | 不同月：月日 | 不同日：月日 | 同一天：时分
 */
export const _date = (date: number) => {
  if (!dayjs().isSame(date, 'year')) return dayjs(date).format('YYYY-MM-DD')
  if (!dayjs().isSame(date, 'month')) return dayjs(date).format('MM-DD')

  if (dayjs().isSame(date, 'day')) {
    return dayjs(date).format('HH:mm')
  } else {
    return dayjs(date).format('MM-DD')
  }
}
