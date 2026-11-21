import type { Brand, BrandId } from '../brands/types'
import { DAY_NAMES, formatTime, localDayAndMinutes, openStatus } from '../lib/hours'
import { useNow } from '../lib/useNow'
import { Reveal, SectionHeading } from './ui'

const YEAR = new Date().getFullYear()

export function Faq({ brand }: { brand: Brand }) {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
      <Reveal>
        <SectionHeading eyebrow="Good to know" title="Questions, answered" center />
      </Reveal>
      <div className="divide-y divide-line border-y border-line">
        {brand.faq.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-primary transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-3 pr-12 text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function Visit({ brand }: { brand: Brand }) {
  const { contact } = brand
  const now = useNow()
  const status = openStatus(contact.hours, now, contact.timezone)
  const today = localDayAndMinutes(now, contact.timezone).day
  const d = 0.008
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${contact.lng - d},${contact.lat - d / 2},${contact.lng + d},${contact.lat + d / 2}&layer=mapnik&marker=${contact.lat},${contact.lng}`
  const directions = `https://www.google.com/maps/search/?api=1&query=${contact.lat},${contact.lng}`
  // Monday-first order reads more naturally for opening hours.
  const order = [1, 2, 3, 4, 5, 6, 0]

  return (
    <section id="visit" className="bg-surface-alt py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2">
        <Reveal>
          <SectionHeading eyebrow="Visit us" title="Come say hello" />
          <address className="not-italic text-lg text-ink">
            {contact.address}
            <br />
            {contact.city}
          </address>
          <p className="mt-2 text-muted">
            {contact.phoneDisplay} · {contact.email}
          </p>
          <p className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${status.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            <span className={`h-2 w-2 rounded-full ${status.isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
            {status.label}
          </p>
          <table className="mt-6 w-full max-w-sm text-left">
            <caption className="sr-only">Opening hours</caption>
            <tbody>
              {order.map((day) => {
                const slot = contact.hours[day]
                return (
                  <tr key={day} className={day === today ? 'font-semibold text-primary' : 'text-ink'}>
                    <th scope="row" className="py-1.5 font-[inherit]">
                      {DAY_NAMES[day]}
                    </th>
                    <td className="py-1.5 text-right">{slot ? `${formatTime(slot.open)} – ${formatTime(slot.close)}` : 'Closed'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <a href={directions} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
            Get directions <span aria-hidden="true">↗</span>
          </a>
        </Reveal>
        <Reveal delay={120}>
          <iframe
            title={`Map showing ${brand.name}`}
            src={mapSrc}
            loading="lazy"
            className="h-[420px] w-full rounded-brand border border-line bg-surface"
          />
        </Reveal>
      </div>
    </section>
  )
}

export function Footer({ brand }: { brand: Brand }) {
  return (
    <footer className="bg-ink py-14 text-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="flex items-center gap-2 font-display text-2xl font-semibold">
            <span aria-hidden="true">{brand.icon}</span> {brand.name}
          </p>
          <p className="mt-3 text-sm opacity-70">{brand.description}</p>
          <p className="mt-3 text-sm opacity-70">Instagram: @{brand.contact.instagram}</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          {brand.nav.map((n) => (
            <li key={n.href}>
              <a href={n.href} className="opacity-80 hover:opacity-100">
                {n.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#book" className="opacity-80 hover:opacity-100">
              {brand.booking.kind === 'order' ? 'Order' : 'Book'}
            </a>
          </li>
          <li>
            <a href="#faq" className="opacity-80 hover:opacity-100">FAQ</a>
          </li>
        </ul>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-5 text-xs opacity-60">
        © {YEAR} {brand.name} - a fictional business. Demo website by Priyesh Raj. Photos from Unsplash.
      </p>
    </footer>
  )
}

export function BrandSwitcher({ current, onChange }: { current: BrandId; onChange: (id: BrandId) => void }) {
  const options: { id: BrandId; label: string; icon: string }[] = [
    { id: 'bakery', label: 'Bakery', icon: '🥐' },
    { id: 'salon', label: 'Salon', icon: '✂️' },
  ]
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:left-4 sm:translate-x-0">
      <div role="radiogroup" aria-label="Demo: switch website theme" className="flex items-center gap-1 rounded-full bg-ink/90 p-1 text-sm text-white shadow-2xl backdrop-blur">
        <span className="px-3 text-xs tracking-wider whitespace-nowrap text-white/60 uppercase">Demo</span>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={current === o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-full px-4 py-2 font-medium whitespace-nowrap transition ${current === o.id ? 'bg-white text-ink' : 'hover:bg-white/10'}`}
          >
            <span aria-hidden="true">{o.icon}</span> {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
