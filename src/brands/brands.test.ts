import { describe, expect, it } from 'vitest'
import { brands, parseBrandId } from '.'

describe.each(Object.values(brands))('$name brand data', (brand) => {
  it('has unique offering ids', () => {
    const ids = brand.offerings.items.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('puts every offering in a declared category, and every category has offerings', () => {
    for (const item of brand.offerings.items) expect(brand.offerings.categories).toContain(item.category)
    for (const category of brand.offerings.categories) {
      expect(brand.offerings.items.some((o) => o.category === category)).toBe(true)
    }
  })

  it('has positive prices and https images everywhere', () => {
    for (const item of brand.offerings.items) {
      expect(item.price).toBeGreaterThan(0)
      expect(item.image).toMatch(/^https:\/\//)
    }
    for (const img of brand.gallery.images) expect(img.src).toMatch(/^https:\/\//)
    expect(brand.hero.image).toMatch(/^https:\/\//)
  })

  it('has valid opening hours for all 7 days and at least one open day', () => {
    const days = [0, 1, 2, 3, 4, 5, 6].map((d) => brand.contact.hours[d])
    expect(days.filter(Boolean).length).toBeGreaterThan(0)
    for (const slot of days) {
      if (!slot) continue
      expect(slot.open).toMatch(/^\d{2}:\d{2}$/)
      expect(slot.close > slot.open).toBe(true)
    }
  })

  it('uses placeholder contact details in the demo (no real WhatsApp number)', () => {
    expect(brand.contact.whatsapp).toBe('')
    expect(brand.contact.email).toMatch(/\.example$/)
  })
})

it('parses brand ids safely', () => {
  expect(parseBrandId('salon')).toBe('salon')
  expect(parseBrandId('SALON')).toBeNull()
  expect(parseBrandId(undefined)).toBeNull()
})
