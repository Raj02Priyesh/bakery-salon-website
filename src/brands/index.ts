import { bakery } from './bakery'
import { salon } from './salon'
import type { Brand, BrandId } from './types'

export const brands: Record<BrandId, Brand> = { bakery, salon }

/**
 * A client build can be locked to one brand with VITE_BRAND=salon (the demo switcher is then hidden).
 * Otherwise the brand comes from ?brand=… in the URL, defaulting to the bakery.
 */
export const lockedBrand = parseBrandId(import.meta.env.VITE_BRAND)

export function parseBrandId(value: unknown): BrandId | null {
  return value === 'bakery' || value === 'salon' ? value : null
}

export function initialBrandId(search: string): BrandId {
  if (lockedBrand) return lockedBrand
  return parseBrandId(new URLSearchParams(search).get('brand')) ?? 'bakery'
}
