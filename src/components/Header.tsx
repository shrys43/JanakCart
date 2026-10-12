import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Heart, MapPin, Search, ShoppingBag, Store, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { categories } from '@/data/fixtures'
import { useShop } from '@/lib/shop'
import { Logo } from './Logo'

export function Header() {
  const { cartCount, wishlist, hydrated } = useShop()
  const navigate = useNavigate()
  const currentQ = useRouterState({
    select: (s) => {
      const q = (s.location.search as Record<string, unknown>).q
      return typeof q === 'string' ? q : ''
    },
  })
  const [q, setQ] = useState(currentQ)
  useEffect(() => setQ(currentQ), [currentQ])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate({ to: '/search', search: { q: q.trim() || undefined } })
  }

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="bg-ink-900 text-[12px] text-paper/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5">
          <p className="truncate">
            <span className="font-semibold text-marigold-300">Cash on Delivery</span> across Nepal · eSewa &amp; Khalti coming soon
          </p>
          <div className="hidden items-center gap-5 sm:flex">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Delivering to 40+ districts</span>
            <Link to="/sell" className="inline-flex items-center gap-1 font-semibold text-marigold-300 hover:text-white">
              <Store className="h-3.5 w-3.5" /> Sell on JanakCart
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link to="/" aria-label="JanakCart home"><Logo /></Link>

        <form onSubmit={submit} className="order-3 w-full md:order-none md:flex-1" role="search">
          <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 ring-1 ring-ink-900/10 focus-within:ring-2 focus-within:ring-sindoor-500">
            <Search className="h-4.5 w-4.5 text-ink-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, pashmina, Mithila art, tea…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-500"
              aria-label="Search products"
            />
            <button type="submit" className="hidden rounded-full bg-sindoor-600 px-4 py-1 text-sm font-semibold text-white hover:bg-sindoor-700 sm:block">
              Search
            </button>
          </label>
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to="/login" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium hover:bg-paper-dark">
            <UserRound className="h-5 w-5" /> <span className="hidden sm:inline">Sign in</span>
          </Link>
          <Link to="/wishlist" className="relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium hover:bg-paper-dark" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {hydrated && wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>
          <Link to="/cart" className="relative flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-700">
            <ShoppingBag className="h-5 w-5" /> <span className="hidden sm:inline">Cart</span>
            {hydrated && cartCount > 0 && <Badge n={cartCount} />}
          </Link>
        </nav>
      </div>

      <div className="border-y border-ink-900/5 bg-white/60">
        <div className="scrollbar-none mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5 text-sm">
          <Link to="/search" search={{ deals: true }} className="shrink-0 rounded-full px-3 py-1.5 font-semibold text-sindoor-600 hover:bg-sindoor-50">
            🔥 Today’s deals
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/search"
              search={{ category: c.slug }}
              className="shrink-0 rounded-full px-3 py-1.5 text-ink-700 hover:bg-paper-dark hover:text-ink-900"
              activeProps={{ className: 'bg-paper-dark text-ink-900 font-semibold' }}
              activeOptions={{ includeSearch: true }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-marigold-400 px-1 text-[11px] font-bold text-ink-900 ring-2 ring-paper">
      {n}
    </span>
  )
}
