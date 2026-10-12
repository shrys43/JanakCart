import { Link, createFileRoute } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { getProduct } from '@/data/fixtures'
import { useShop } from '@/lib/shop'

export const Route = createFileRoute('/wishlist')({
  head: () => ({ meta: [{ title: 'Wishlist — JanakCart' }] }),
  component: WishlistPage,
})

function WishlistPage() {
  const { wishlist, hydrated } = useShop()
  const items = wishlist.map(getProduct).filter((p) => p !== undefined)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">My wishlist {hydrated && <span className="text-ink-500">({items.length})</span>}</h1>
      {hydrated && items.length === 0 ? (
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sindoor-50 text-sindoor-600"><Heart className="h-9 w-9" /></div>
          <p className="mt-6 font-display text-xl font-bold">Nothing saved yet</p>
          <p className="mt-2 text-ink-500">Tap the heart on any product to keep it here for later.</p>
          <Link to="/search" className="mt-8 inline-block rounded-full bg-sindoor-600 px-6 py-3 font-semibold text-white">Explore products</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
