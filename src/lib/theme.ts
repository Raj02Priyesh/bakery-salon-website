import type { Brand } from '../brands/types'

/** Push the brand's theme into CSS variables, and update the title, description and favicon. */
export function applyBrand(brand: Brand) {
  const root = document.documentElement.style
  const t = brand.theme
  const vars: Record<string, string> = {
    '--brand-primary': t.primary,
    '--brand-primary-ink': t.primaryInk,
    '--brand-accent': t.accent,
    '--brand-surface': t.surface,
    '--brand-surface-alt': t.surfaceAlt,
    '--brand-ink': t.ink,
    '--brand-muted': t.muted,
    '--brand-border': t.border,
    '--brand-display-font': t.displayFont,
    '--brand-body-font': t.bodyFont,
    '--brand-radius': t.radius,
  }
  for (const [k, v] of Object.entries(vars)) root.setProperty(k, v)

  document.title = `${brand.name} — ${brand.tagline}`
  document.querySelector('meta[name="description"]')?.setAttribute('content', brand.description)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.primary)
  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (icon) {
    icon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${brand.icon}</text></svg>`
  }
}
