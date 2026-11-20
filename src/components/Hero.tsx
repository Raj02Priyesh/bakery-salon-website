import type { Brand } from '../brands/types'
import { openStatus } from '../lib/hours'
import { buttonGhost, buttonPrimary } from '../lib/format'
import { srcSet } from '../lib/images'
import { useNow } from '../lib/useNow'

export function Hero({ brand }: { brand: Brand }) {
  const now = useNow()
  const status = openStatus(brand.contact.hours, now, brand.contact.timezone)
  return (
    <section id="top" className="relative isolate flex min-h-[92svh] items-end overflow-hidden text-white">
      <img
        key={brand.hero.image}
        src={brand.hero.image}
        srcSet={srcSet(brand.hero.image, [800, 1200, 1600, 2000])}
        sizes="100vw"
        alt=""
        className="hero-image absolute inset-0 -z-20 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/45 to-black/25" aria-hidden="true" />

      <div className="mx-auto w-full max-w-6xl px-5 pt-32 pb-16 sm:pb-24">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${status.isOpen ? 'bg-emerald-400' : 'bg-amber-400'}`} aria-hidden="true" />
          {status.label}
        </p>
        <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-accent uppercase">{brand.hero.eyebrow}</p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.05] font-semibold sm:text-7xl">{brand.hero.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-white/85 sm:text-xl">{brand.hero.subtitle}</p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a href="#book" className={buttonPrimary}>
            {brand.hero.primaryCta}
            <span aria-hidden="true">→</span>
          </a>
          <a href="#menu" className={`${buttonGhost} text-white`}>
            {brand.hero.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  )
}

export function Highlights({ brand }: { brand: Brand }) {
  return (
    <section aria-label="Why choose us" className="relative z-10 mx-auto -mt-12 max-w-6xl px-5">
      <ul className="grid gap-4 rounded-brand border border-line bg-surface p-6 shadow-xl shadow-black/5 sm:grid-cols-2 lg:grid-cols-4">
        {brand.highlights.map((h) => (
          <li key={h.title} className="flex gap-4 p-2">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-alt text-2xl" aria-hidden="true">
              {h.icon}
            </span>
            <div>
              <h3 className="font-semibold text-ink">{h.title}</h3>
              <p className="mt-1 text-sm text-muted">{h.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
