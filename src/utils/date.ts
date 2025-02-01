import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export const formatDate = (date: string | number | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const formatDistanceToNow = (date: string | number | Date) => {
  return dayjs(date).fromNow()
}

export const isValidDate = (date: any) => {
  return dayjs(date).isValid()
}

export const addDays = (date: Date, days: number) => {
  return dayjs(date).add(days, 'day').toDate()
}

export const addMonths = (date: Date, months: number) => {
  return dayjs(date).add(months, 'month').toDate()
}

export const addYears = (date: Date, years: number) => {
  return dayjs(date).add(years, 'year').toDate()
}

export const startOfDay = (date: Date) => {
  return dayjs(date).startOf('day').toDate()
}

export const endOfDay = (date: Date) => {
  return dayjs(date).endOf('day').toDate()
}

export const isSameDay = (dateA: Date, dateB: Date) => {
  return dayjs(dateA).isSame(dateB, 'day')
}

export const isBefore = (dateA: Date, dateB: Date) => {
  return dayjs(dateA).isBefore(dateB)
}

export const isAfter = (dateA: Date, dateB: Date) => {
  return dayjs(dateA).isAfter(dateB)
} 