import { useCallback, useEffect, useState } from 'react'
import { brands, initialBrandId, lockedBrand } from './brands'
import type { BrandId, Offering } from './brands/types'
import { Booking } from './components/Booking'
import { Hero, Highlights } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Offerings } from './components/Offerings'
import { About, Gallery, TeamAndReviews } from './components/Story'
import { BrandSwitcher, Faq, Footer, Visit } from './components/Visit'
import { applyBrand } from './lib/theme'

export default function App() {
  const [brandId, setBrandId] = useState<BrandId>(() => initialBrandId(window.location.search))
  const [preselected, setPreselected] = useState<{ id: string; nonce: number } | null>(null)
  const brand = brands[brandId]

  useEffect(() => applyBrand(brand), [brand])

  const switchBrand = useCallback((id: BrandId) => {
    setBrandId(id)
    setPreselected(null)
    const url = new URL(window.location.href)
    url.searchParams.set('brand', id)
    window.history.replaceState(null, '', url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const selectOffering = useCallback((offering: Offering) => {
    setPreselected({ id: offering.id, nonce: Date.now() })
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <>
      <a href="#menu" className="sr-only z-50 rounded bg-primary px-4 py-2 text-primary-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <Navbar brand={brand} />
      <main key={brand.id}>
        <Hero brand={brand} />
        <Highlights brand={brand} />
        <Offerings brand={brand} onSelect={selectOffering} />
        <About brand={brand} />
        <Gallery brand={brand} />
        <TeamAndReviews brand={brand} />
        <Booking brand={brand} preselected={preselected} />
        <Faq brand={brand} />
        <Visit brand={brand} />
      </main>
      <Footer brand={brand} />
      {!lockedBrand && <BrandSwitcher current={brandId} onChange={switchBrand} />}
    </>
  )
}
