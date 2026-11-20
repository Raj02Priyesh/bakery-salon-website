import { describe, expect, it } from 'vitest'
import { bakery } from '../brands/bakery'
import { salon } from '../brands/salon'
import { bookingMessage, emptyRequest, estimate, normalizePhone, validateBooking, whatsappUrl } from './booking'
import { formatTime, openStatus } from './hours'

// Wednesday 10 Dec 2025, 10:00 local time.
const NOW = new Date(2025, 11, 10, 10, 0)

const valid = { ...emptyRequest('sourdough'), name: 'Asha', phone: '98765 43210', date: '2025-12-11', time: '09:00', quantity: 2 }

describe('normalizePhone', () => {
  it('accepts Indian mobile numbers in common formats', () => {
    expect(normalizePhone('9876543210')).toBe('9876543210')
    expect(normalizePhone('+91 98765 43210')).toBe('9876543210')
    expect(normalizePhone('09876543210')).toBe('9876543210')
  })
  it('rejects landlines and short numbers', () => {
    expect(normalizePhone('0801234567')).toBeNull()
    expect(normalizePhone('12345')).toBeNull()
  })
})

describe('validateBooking', () => {
  it('accepts a complete request within opening hours', () => {
    expect(validateBooking(valid, bakery, NOW)).toEqual({})
  })

  it('reports missing fields', () => {
    const errors = validateBooking(emptyRequest(), bakery, NOW)
    expect(Object.keys(errors).sort()).toEqual(['date', 'name', 'offeringId', 'phone'])
  })

  it('rejects days the business is closed', () => {
    // 15 Dec 2025 is a Monday; the bakery is closed on Mondays.
    expect(validateBooking({ ...valid, date: '2025-12-15' }, bakery, NOW).date).toMatch(/closed on Mondays/)
  })

  it('rejects times outside opening hours (and the last 30 minutes)', () => {
    expect(validateBooking({ ...valid, time: '06:30' }, bakery, NOW).time).toMatch(/between 7 AM and 7:30 PM/)
    expect(validateBooking({ ...valid, time: '19:45' }, bakery, NOW).time).toBeDefined()
  })

  it('enforces the notice period and rejects the past', () => {
    expect(validateBooking({ ...valid, date: '2025-12-10', time: '15:00' }, bakery, NOW).date).toMatch(/12 hours/)
    expect(validateBooking({ ...valid, date: '2025-12-09', time: '15:00' }, bakery, NOW).date).toMatch(/already passed/)
    // The salon only needs 2 hours' notice.
    expect(validateBooking({ ...emptyRequest('haircut'), name: 'Asha', phone: '9876543210', date: '2025-12-10', time: '13:00' }, salon, NOW)).toEqual({})
  })

  it('limits quantity for orders only', () => {
    expect(validateBooking({ ...valid, quantity: 0 }, bakery, NOW).quantity).toBeDefined()
    expect(validateBooking({ ...emptyRequest('haircut'), name: 'Asha', phone: '9876543210', date: '2025-12-11', time: '11:00', quantity: 0 }, salon, NOW).quantity).toBeUndefined()
  })
})

describe('message and estimate', () => {
  it('builds a readable WhatsApp message', () => {
    const msg = bookingMessage({ ...valid, notes: 'Sliced please' }, bakery)
    expect(msg).toContain('Country sourdough × 2')
    expect(msg).toContain('Pickup: Thursday, 11 December, 9 AM')
    expect(msg).toContain('Phone: 9876543210')
    expect(msg).toContain('Notes: Sliced please')
    expect(whatsappUrl('919000000000', msg)).toMatch(/^https:\/\/wa\.me\/919000000000\?text=Hi%20Crumb/)
  })

  it('includes the stylist for salon bookings', () => {
    const msg = bookingMessage({ ...emptyRequest('balayage'), name: 'Asha', phone: '9876543210', date: '2025-12-11', time: '11:00', staff: 'Nisha Fernandes' }, salon)
    expect(msg).toContain('Stylist: Nisha Fernandes')
    expect(msg).toContain('book an appointment')
  })

  it('multiplies price by quantity for orders', () => {
    expect(estimate(valid, bakery)).toBe(520)
    expect(estimate({ ...emptyRequest('haircut'), quantity: 3 }, salon)).toBe(900)
  })
})

describe('hours', () => {
  it('formats times', () => {
    expect(formatTime('07:00')).toBe('7 AM')
    expect(formatTime('20:30')).toBe('8:30 PM')
    expect(formatTime('12:00')).toBe('12 PM')
  })

  it('reports open and closed status in the business time zone', () => {
    // 10:00 IST on Wednesday 10 Dec 2025 = 04:30 UTC
    const wedMorning = new Date(Date.UTC(2025, 11, 10, 4, 30))
    expect(openStatus(bakery.contact.hours, wedMorning, 'Asia/Kolkata')).toEqual({ isOpen: true, label: 'Open now · closes 8 PM' })
    // 22:00 IST Sunday 14 Dec -> bakery closed Monday, opens Tuesday
    const sunNight = new Date(Date.UTC(2025, 11, 14, 16, 30))
    expect(openStatus(bakery.contact.hours, sunNight, 'Asia/Kolkata').label).toBe('Closed · opens Tuesday 7 AM')
    // 06:00 IST Wednesday -> opens later today
    const wedEarly = new Date(Date.UTC(2025, 11, 10, 0, 30))
    expect(openStatus(bakery.contact.hours, wedEarly, 'Asia/Kolkata').label).toBe('Closed · opens today 7 AM')
  })
})
