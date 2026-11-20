/** Build a cropped, compressed Unsplash CDN URL from a photo id. */
export function unsplash(id: string, width = 800, height?: number): string {
  const size = height ? `&w=${width}&h=${height}&fit=crop` : `&w=${width}`
  return `https://images.unsplash.com/${id}?fm=jpg&q=75&auto=format${size}`
}

/** `srcSet` for responsive images from the same Unsplash photo URL. */
export function srcSet(url: string, widths = [400, 800, 1200]): string {
  return widths
    .map((w) => `${url.replace(/([?&])w=\d+/, `$1w=${w}`).replace(/&h=\d+/, '')} ${w}w`)
    .join(', ')
}
