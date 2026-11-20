import { useEffect, useState } from 'react'
import type { Brand } from '../brands/types'

export function Navbar({ brand }: { brand: Brand }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const solid = scrolled || open
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        solid ? 'bg-surface/95 text-ink shadow-sm backdrop-blur' : 'bg-transparent text-white'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4" aria-label="Main">
        <a href="#top" className="flex items-center gap-2" aria-label={`${brand.name} home`}>
          <span className="text-2xl" aria-hidden="true">{brand.icon}</span>
          <span className="font-display text-2xl font-semibold tracking-tight">{brand.name}</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {brand.nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="text-sm font-medium opacity-90 transition hover:opacity-100 hover:text-accent">
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#book"
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                solid ? 'bg-primary text-primary-ink hover:opacity-90' : 'bg-white text-ink hover:bg-white/90'
              }`}
            >
              {brand.booking.kind === 'order' ? 'Order now' : 'Book now'}
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="rounded-full p-2 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-surface px-5 pb-6 md:hidden">
          <ul className="flex flex-col py-2">
            {brand.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="block py-3 text-lg font-medium" onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#book" onClick={() => setOpen(false)} className="block rounded-full bg-primary py-3 text-center font-semibold text-primary-ink">
            {brand.booking.kind === 'order' ? 'Order now' : 'Book now'}
          </a>
        </div>
      )}
    </header>
  )
}
