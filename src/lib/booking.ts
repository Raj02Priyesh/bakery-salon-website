import type { Brand } from '../brands/types'
import { DAY_NAMES, formatTime, toMinutes } from './hours'

export interface BookingRequest {
  name: string
  phone: string
  /** yyyy-mm-dd */
  date: string
  /** HH:MM (24h) */
  time: string
  offeringId: string
  quantity: number
  staff: string
  notes: string
}

export type BookingErrors = Partial<Record<keyof BookingRequest, string>>

export const emptyRequest = (offeringId = ''): BookingRequest => ({
  name: '',
  phone: '',
  date: '',
  time: '',
  offeringId,
  quantity: 1,
  staff: 'Any stylist',
  notes: '',
})

/** Indian mobile: 10 digits starting 6-9, optionally prefixed with +91 / 91 / 0, spaces allowed. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '')
  return /^[6-9]\d{9}$/.test(digits) ? digits : null
}

/**
 * Validates a request against the brand's opening hours and notice period.
 * `now` is the current moment expressed as a local wall-clock Date in the business's time zone.
 */
export function validateBooking(req: BookingRequest, brand: Brand, now: Date): BookingErrors {
  const errors: BookingErrors = {}
  const { booking, contact, offerings } = brand

  if (req.name.trim().length < 2) errors.name = 'Please enter your name.'
  if (!normalizePhone(req.phone)) errors.phone = 'Enter a valid 10-digit mobile number.'
  if (!offerings.items.some((o) => o.id === req.offeringId)) errors.offeringId = 'Please choose an option.'
  if (booking.askQuantity && (!Number.isInteger(req.quantity) || req.quantity < 1 || req.quantity > 50)) {
    errors.quantity = 'Quantity must be between 1 and 50.'
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(req.date)) {
    errors.date = 'Please pick a date.'
  } else if (!/^\d{2}:\d{2}$/.test(req.time)) {
    errors.time = 'Please pick a time.'
  } else {
    const [y, m, d] = req.date.split('-').map(Number)
    const day = new Date(y, m - 1, d).getDay()
    const slot = contact.hours[day]
    const requested = new Date(y, m - 1, d, ...req.time.split(':').map(Number) as [number, number])
    const hoursAhead = (requested.getTime() - now.getTime()) / 3_600_000

    if (!slot) {
      errors.date = `We’re closed on ${DAY_NAMES[day]}s.`
    } else if (toMinutes(req.time) < toMinutes(slot.open) || toMinutes(req.time) > toMinutes(slot.close) - 30) {
      errors.time = `Choose a time between ${formatTime(slot.open)} and ${formatTime(minusMinutes(slot.close, 30))}.`
    } else if (hoursAhead < booking.minNoticeHours) {
      errors.date = hoursAhead < 0
        ? 'That time has already passed.'
        : `Please give us at least ${booking.minNoticeHours} hours’ notice.`
    } else if (hoursAhead > 24 * 60) {
      errors.date = 'We take requests up to 60 days ahead.'
    }
  }
  return errors
}

function minusMinutes(time: string, mins: number): string {
  const total = toMinutes(time) - mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Plain-text summary sent to the business (e.g. via WhatsApp). */
export function bookingMessage(req: BookingRequest, brand: Brand): string {
  const item = brand.offerings.items.find((o) => o.id === req.offeringId)
  const [y, m, d] = req.date.split('-').map(Number)
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  const lines = [
    `Hi ${brand.name}! I'd like to ${brand.booking.kind === 'order' ? 'place an order' : 'book an appointment'}.`,
    '',
    `${brand.booking.offeringLabel}: ${item?.name ?? req.offeringId}${brand.booking.askQuantity ? ` × ${req.quantity}` : ''}`,
    brand.booking.askStaff ? `Stylist: ${req.staff}` : null,
    `${brand.booking.kind === 'order' ? 'Pickup' : 'When'}: ${dateLabel}, ${formatTime(req.time)}`,
    `Name: ${req.name.trim()}`,
    `Phone: ${normalizePhone(req.phone) ?? req.phone}`,
    req.notes.trim() ? `Notes: ${req.notes.trim()}` : null,
  ]
  return lines.filter((l) => l !== null).join('\n')
}

/** Estimated total in rupees (orders) or starting price (appointments). */
export function estimate(req: BookingRequest, brand: Brand): number {
  const item = brand.offerings.items.find((o) => o.id === req.offeringId)
  if (!item) return 0
  return item.price * (brand.booking.askQuantity ? req.quantity : 1)
}

export function whatsappUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

/** Current wall-clock time in the given time zone, as a local Date (for comparing with form inputs). */
export function nowInZone(timeZone: string, now = new Date()): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute))
}
