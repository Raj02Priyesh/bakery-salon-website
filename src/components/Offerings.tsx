import { useState } from 'react'
import type { Brand, Offering } from '../brands/types'
import { formatDuration, formatPrice } from '../lib/format'
import { Reveal, SectionHeading } from './ui'

export function Offerings({ brand, onSelect }: { brand: Brand; onSelect: (offering: Offering) => void }) {
  const [category, setCategory] = useState('All')
  const categories = ['All', ...brand.offerings.categories]
  const items = category === 'All' ? brand.offerings.items : brand.offerings.items.filter((o) => o.category === category)
  const cta = brand.booking.kind === 'order' ? 'Order' : 'Book'

  return (
    <section id="menu" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <SectionHeading
          eyebrow={brand.booking.kind === 'order' ? 'The menu' : 'Services'}
          title={brand.offerings.title}
          subtitle={brand.offerings.subtitle}
        />
      </Reveal>

      <div role="tablist" aria-label="Filter by category" className="no-scrollbar -mx-5 mb-10 flex gap-2 overflow-x-auto px-5">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition ${
              category === c ? 'border-primary bg-primary text-primary-ink' : 'border-line bg-surface text-ink hover:border-primary'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.id}>
            <Reveal delay={(i % 3) * 80} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-brand border border-line bg-surface transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-alt">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  {item.tags?.[0] && (
                    <span className="absolute top-3 left-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                      {item.tags[0]}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl font-semibold text-ink">{item.name}</h3>
                    <p className="shrink-0 text-right">
                      <span className="font-semibold text-primary">
                        {item.duration ? 'from ' : ''}
                        {formatPrice(item.price)}
                      </span>
                      {item.priceNote && <span className="block text-xs text-muted">{item.priceNote}</span>}
                    </p>
                  </div>
                  <p className="mt-2 flex-1 text-sm text-muted">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {item.duration ? `⏱ ${formatDuration(item.duration)}` : item.tags?.slice(1).join(' · ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="rounded-full bg-surface-alt px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-ink"
                      aria-label={`${cta} ${item.name}`}
                    >
                      {cta} →
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
