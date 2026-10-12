import { Star } from 'lucide-react'

export function RatingPill({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="inline-flex items-center gap-0.5 rounded-md bg-leaf-600 px-1.5 py-0.5 font-semibold text-white">
        {rating.toFixed(1)} <Star className="h-3 w-3 fill-current" />
      </span>
      {count !== undefined && <span className="text-ink-500">({count.toLocaleString('en-IN')})</span>}
    </span>
  )
}

export function Stars({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex text-marigold-500" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(rating) ? 'fill-current' : 'text-ink-300'}`} />
      ))}
    </span>
  )
}
