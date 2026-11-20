export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-ink shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 active:translate-y-0'
export const buttonGhost =
  'inline-flex items-center justify-center gap-2 rounded-full border border-current px-7 py-3.5 font-semibold transition hover:bg-white/10'

export const formatPrice = (rupees: number) => `₹${rupees.toLocaleString('en-IN')}`

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}
