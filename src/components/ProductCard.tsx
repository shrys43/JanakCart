import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { discountPercent, LOW_STOCK_THRESHOLD, type Product } from '@/data/fixtures'
import { cdn, npr } from '@/lib/format'
import { useShop } from '@/lib/shop'
import { RatingPill } from './Stars'

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { isWishlisted, toggleWishlist, hydrated } = useShop()
  const off = discountPercent(product)
  const saved = hydrated && isWishlisted(product.id)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-900/5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(28,24,48,0.25)]">
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-ink-900/5 transition hover:scale-110"
      >
        <Heart className={`h-4 w-4 ${saved ? 'fill-sindoor-600 text-sindoor-600' : 'text-ink-500'}`} />
      </button>
      <Link to="/products/$productId" params={{ productId: product.id }} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-paper">
          <img
            src={cdn(product.image, compact ? 320 : 420)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {off >= 30 && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-sindoor-600 px-2 py-0.5 text-[11px] font-bold text-white">
              {off}% OFF
            </span>
          )}
          {product.stock === 0 ? (
            <span className="absolute inset-x-0 bottom-0 bg-ink-900/80 py-1 text-center text-xs font-semibold text-white">Out of stock</span>
          ) : product.stock <= LOW_STOCK_THRESHOLD ? (
            <span className="absolute inset-x-0 bottom-0 bg-marigold-400/95 py-1 text-center text-xs font-semibold text-ink-900">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{product.brand}</p>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink-900">{product.name}</h3>
          <RatingPill rating={product.rating} count={product.ratingCount} />
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
            <span className="text-base font-bold">{npr(product.price)}</span>
            <span className="text-xs text-ink-500 line-through">{npr(product.mrp)}</span>
            <span className="text-xs font-semibold text-leaf-600">{off}% off</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
