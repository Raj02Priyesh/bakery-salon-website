import type { OpeningHours } from '../brands/types'

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Minutes since midnight for "HH:MM". */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** "07:00" -> "7 AM", "20:30" -> "8:30 PM". */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

/** Day of week and minutes-since-midnight for a moment, in the business's own time zone. */
export function localDayAndMinutes(date: Date, timeZone: string): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export interface OpenStatus {
  isOpen: boolean
  /** Human-readable status, e.g. "Open now · closes 8 PM" or "Closed · opens Tuesday 7 AM". */
  label: string
}

export function openStatus(hours: OpeningHours, now: Date, timeZone: string): OpenStatus {
  const { day, minutes } = localDayAndMinutes(now, timeZone)
  const today = hours[day]
  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { isOpen: true, label: `Open now · closes ${formatTime(today.close)}` }
  }
  // Find the next opening: later today, or the next open day.
  if (today && minutes < toMinutes(today.open)) {
    return { isOpen: false, label: `Closed · opens today ${formatTime(today.open)}` }
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = (day + offset) % 7
    const slot = hours[next]
    if (slot) {
      const when = offset === 1 ? 'tomorrow' : DAY_NAMES[next]
      return { isOpen: false, label: `Closed · opens ${when} ${formatTime(slot.open)}` }
    }
  }
  return { isOpen: false, label: 'Temporarily closed' }
}
