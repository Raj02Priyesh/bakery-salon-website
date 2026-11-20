import { useCallback, useEffect, useState } from 'react'
import type { Brand } from '../brands/types'
import { srcSet } from '../lib/images'
import { Avatar, Reveal, SectionHeading, Stars } from './ui'

export function About({ brand }: { brand: Brand }) {
  return (
    <section id="about" className="bg-surface-alt py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <img
              src={brand.about.image}
              alt=""
              loading="lazy"
              className="aspect-[5/6] w-full rounded-brand object-cover shadow-2xl shadow-black/10"
            />
            <div className="absolute -right-3 -bottom-6 rounded-brand bg-primary px-6 py-5 text-primary-ink shadow-xl sm:-right-6">
              <p className="font-display text-3xl font-semibold">{brand.about.stats[0].value}</p>
              <p className="text-sm opacity-85">{brand.about.stats[0].label}</p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <SectionHeading eyebrow="Our story" title={brand.about.title} />
          <div className="space-y-4 text-lg text-muted">
            {brand.about.paragraphs.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {brand.about.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-semibold text-primary">{s.value}</dd>
                <dd className="mt-1 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}

export function Gallery({ brand }: { brand: Brand }) {
  const [index, setIndex] = useState<number | null>(null)
  const images = brand.gallery.images
  const close = useCallback(() => setIndex(null), [])
  const step = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)), [images.length])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [index, close, step])

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <SectionHeading eyebrow="Gallery" title={brand.gallery.title} />
      </Reveal>
      <ul className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-3">
        {images.map((img, i) => (
          <li key={img.src} className={i === 0 ? 'row-span-2' : i === 4 ? 'md:col-span-2' : ''}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group h-full w-full overflow-hidden rounded-brand bg-surface-alt"
              aria-label={`Open photo: ${img.alt}`}
            >
              <img
                src={img.src}
                srcSet={srcSet(img.src, [400, 800])}
                sizes="(min-width: 768px) 33vw, 50vw"
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[index].alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <img
            src={images[index].src}
            alt={images[index].alt}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {images[index].alt} · {index + 1} / {images.length}
          </p>
          {[
            { label: 'Previous photo', delta: -1, pos: 'left-3', path: 'M15 18l-6-6 6-6' },
            { label: 'Next photo', delta: 1, pos: 'right-3', path: 'M9 6l6 6-6 6' },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              aria-label={b.label}
              onClick={(e) => {
                e.stopPropagation()
                step(b.delta)
              }}
              className={`absolute ${b.pos} top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25`}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d={b.path} />
              </svg>
            </button>
          ))}
          <button type="button" aria-label="Close" onClick={close} className="absolute top-4 right-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}

export function TeamAndReviews({ brand }: { brand: Brand }) {
  return (
    <section id="reviews" className="bg-primary py-24 text-primary-ink">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-accent uppercase">Kind words</p>
          <h2 className="max-w-2xl font-display text-4xl font-semibold sm:text-5xl">What our regulars say</h2>
        </Reveal>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {brand.testimonials.map((t, i) => (
            <li key={t.author}>
              <Reveal delay={i * 100} className="h-full">
                <figure className="flex h-full flex-col rounded-brand bg-white/10 p-7 backdrop-blur">
                  <Stars rating={t.rating} />
                  <blockquote className="mt-4 flex-1 font-display text-xl leading-snug">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 text-sm">
                    <span className="font-semibold">{t.author}</span>
                    <span className="opacity-70"> · {t.detail}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal>
          <h3 className="mt-24 font-display text-3xl font-semibold">{brand.team.title}</h3>
        </Reveal>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {brand.team.members.map((m, i) => (
            <li key={m.name}>
              <Reveal delay={i * 100} className="flex items-start gap-4">
                <Avatar name={m.name} />
                <div>
                  <p className="font-display text-xl font-semibold">{m.name}</p>
                  <p className="text-sm text-accent">{m.role}</p>
                  <p className="mt-2 text-sm opacity-80">{m.bio}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
