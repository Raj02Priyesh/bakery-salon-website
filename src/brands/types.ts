/** Everything that makes one business's website: copy, theme, offerings and contact details. */
export interface Brand {
  id: BrandId
  name: string
  tagline: string
  /** Short line under the logo in the footer and the <meta name="description">. */
  description: string
  /** Single emoji used for the favicon and the logo mark. */
  icon: string
  theme: Theme
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    image: string
    primaryCta: string
    secondaryCta: string
  }
  highlights: { title: string; text: string; icon: string }[]
  offerings: {
    /** Section heading, e.g. "Our menu" or "Services & prices". */
    title: string
    subtitle: string
    categories: string[]
    items: Offering[]
  }
  about: { title: string; paragraphs: string[]; image: string; stats: { value: string; label: string }[] }
  gallery: { title: string; images: { src: string; alt: string }[] }
  team: { title: string; members: { name: string; role: string; bio: string }[] }
  testimonials: { quote: string; author: string; detail: string; rating: number }[]
  booking: BookingConfig
  faq: { q: string; a: string }[]
  contact: Contact
  nav: { label: string; href: string }[]
}

export type BrandId = 'bakery' | 'salon'

export interface Theme {
  primary: string
  primaryInk: string
  accent: string
  surface: string
  surfaceAlt: string
  ink: string
  muted: string
  border: string
  displayFont: string
  bodyFont: string
  /** Corner radius used on cards and images. */
  radius: string
}

export interface Offering {
  id: string
  name: string
  description: string
  /** Price in rupees. For services this is the starting price. */
  price: number
  priceNote?: string
  category: string
  image: string
  tags?: string[]
  /** Duration in minutes (services only). */
  duration?: number
}

export interface BookingConfig {
  kind: 'order' | 'appointment'
  title: string
  subtitle: string
  submitLabel: string
  offeringLabel: string
  /** Show a quantity field (bakery orders). */
  askQuantity: boolean
  /** Show a "preferred stylist" field (salon bookings). */
  askStaff: boolean
  /** Minimum notice in hours before the requested date/time. */
  minNoticeHours: number
  successTitle: string
  successText: string
}

export interface OpeningHours {
  /** 0 = Sunday ... 6 = Saturday. `null` means closed. */
  [day: number]: { open: string; close: string } | null
}

export interface Contact {
  address: string
  city: string
  phoneDisplay: string
  /** WhatsApp number in international format without "+" (e.g. 919876543210). Empty in the demo. */
  whatsapp: string
  email: string
  instagram: string
  lat: number
  lng: number
  hours: OpeningHours
  timezone: string
}
