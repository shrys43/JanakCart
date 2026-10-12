const nf = new Intl.NumberFormat('en-IN')

/** Formats whole rupees the way Nepali shoppers read them: "Rs. 1,23,456". */
export const npr = (amount: number) => `Rs. ${nf.format(Math.round(amount))}`

/** Netlify Image CDN URL so pages never ship full-size originals. */
export const cdn = (src: string, w: number, h?: number) =>
  `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}${h ? `&h=${h}&fit=cover` : ''}&fm=webp&q=78`
