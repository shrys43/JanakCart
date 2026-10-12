import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { BadgeCheck, Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck, Wallet, Zap } from 'lucide-react'
import { useState } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { RatingPill, Stars } from '@/components/Stars'
import { discountPercent, getCategory, getProduct, getReviews, getSeller, LOW_STOCK_THRESHOLD, products } from '@/data/fixtures'
import { cdn, npr } from '@/lib/format'
import { destinations, FREE_SHIPPING_THRESHOLD, shipmentDeliveryFee, type Destination } from '@/lib/pricing'
import { useShop } from '@/lib/shop'

export const Route = createFileRoute('/products/$productId')({
  loader: ({ params }) => {
    const product = getProduct(params.productId)
    if (!product) throw notFound()
    return { product, seller: getSeller(product.sellerId)!, reviews: getReviews(product.id) }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — JanakCart` },
          { name: 'description', content: loaderData.product.description },
          { property: 'og:image', content: loaderData.product.image },
        ]
      : [],
  }),
  component: ProductPage,
})

function ProductPage() {
  const { product, seller, reviews } = Route.useLoaderData()
  const shop = useShop()
  const navigate = Route.useNavigate()
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'details' | 'specs'>('details')
  const off = discountPercent(product)
  const category = getCategory(product.category)
  const outOfStock = product.stock === 0
  const maxQty = Math.min(product.stock, 10)
  const wished = shop.hydrated && shop.isWishlisted(product.id)
  const similar = products.filter((p) => p.category === product.category && p.id !== product.id).concat(products.filter((p) => p.sellerId === product.sellerId && p.id !== product.id && p.category !== product.category)).slice(0, 4)

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const share = star === 5 ? 0.62 : star === 4 ? 0.24 : star === 3 ? 0.08 : star === 2 ? 0.03 : 0.03
    return { star, count: Math.round(product.ratingCount * share), share }
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="text-xs text-ink-500">
        <Link to="/" className="hover:text-ink-900">Home</Link> /{' '}
        <Link to="/search" search={{ category: product.category }} className="hover:text-ink-900">{category?.name}</Link> /{' '}
        <span className="text-ink-900">{product.brand}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="lg:sticky lg:top-44 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-ink-900/5">
            <img
              src={cdn(product.image, 900)}
              srcSet={`${cdn(product.image, 600)} 600w, ${cdn(product.image, 900)} 900w`}
              sizes="(max-width: 1024px) 100vw, 640px"
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
            <button
              onClick={() => shop.toggleWishlist(product.id)}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white shadow ring-1 ring-ink-900/5"
              aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`h-5 w-5 ${wished ? 'fill-sindoor-600 text-sindoor-600' : ''}`} />
            </button>
            {off > 0 && <span className="absolute left-4 top-4 rounded-full bg-sindoor-600 px-3 py-1 text-xs font-bold text-white">{off}% OFF</span>}
          </div>
          <div className="mt-4 hidden grid-cols-2 gap-3 lg:grid">
            <button
              disabled={outOfStock}
              onClick={() => shop.addToCart(product.id, qty)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-marigold-400 py-3.5 font-semibold text-ink-900 hover:bg-marigold-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-5 w-5" /> Add to cart
            </button>
            <button
              disabled={outOfStock}
              onClick={() => {
                shop.addToCart(product.id, qty)
                navigate({ to: '/cart' })
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sindoor-600 py-3.5 font-semibold text-white hover:bg-sindoor-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap className="h-5 w-5" /> Buy now
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sindoor-600">{product.brand}</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight sm:text-3xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <RatingPill rating={product.rating} />
            <a href="#reviews" className="text-sm text-ink-500 hover:text-ink-900">{product.ratingCount.toLocaleString('en-IN')} ratings & {reviews.length} reviews</a>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-4xl font-extrabold">{npr(product.price)}</span>
            <span className="text-lg text-ink-500 line-through">{npr(product.mrp)}</span>
            <span className="text-lg font-bold text-leaf-600">{off}% off</span>
          </div>
          <p className="mt-1 text-xs text-ink-500">Inclusive of 13% VAT · SKU {product.sku}</p>

          <div className="mt-4">
            {outOfStock ? (
              <p className="inline-block rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-semibold text-white">Currently out of stock</p>
            ) : product.stock <= LOW_STOCK_THRESHOLD ? (
              <p className="inline-block rounded-lg bg-marigold-100 px-3 py-1.5 text-sm font-semibold text-sindoor-700">Hurry — only {product.stock} left in stock</p>
            ) : (
              <p className="inline-block rounded-lg bg-leaf-50 px-3 py-1.5 text-sm font-semibold text-leaf-600">In stock</p>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="flex items-center rounded-full bg-white ring-1 ring-ink-900/10">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="grid h-10 w-10 place-items-center disabled:opacity-30" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} className="grid h-10 w-10 place-items-center disabled:opacity-30" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
              </div>
              {qty >= maxQty && <span className="text-xs text-ink-500">Max {maxQty} per order</span>}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 lg:hidden">
            <button disabled={outOfStock} onClick={() => shop.addToCart(product.id, qty)} className="inline-flex items-center justify-center gap-2 rounded-full bg-marigold-400 py-3.5 font-semibold disabled:opacity-50">
              <ShoppingBag className="h-5 w-5" /> Add to cart
            </button>
            <button
              disabled={outOfStock}
              onClick={() => {
                shop.addToCart(product.id, qty)
                navigate({ to: '/cart' })
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sindoor-600 py-3.5 font-semibold text-white disabled:opacity-50"
            >
              <Zap className="h-5 w-5" /> Buy now
            </button>
          </div>

          <ul className="mt-7 space-y-2 text-sm">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sindoor-600" /> {h}</li>
            ))}
          </ul>

          <DeliveryCheck weightKg={product.weightKg} price={product.price * qty} />

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { icon: Wallet, t: 'Cash on Delivery' },
              { icon: RotateCcw, t: '7-day returns' },
              { icon: ShieldCheck, t: 'Secure payments' },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="rounded-xl bg-white p-3 ring-1 ring-ink-900/5">
                <Icon className="mx-auto h-5 w-5 text-sindoor-600" />
                <p className="mt-1.5 font-medium">{t}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-ink-900/5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-ink-900 font-display text-lg font-bold text-marigold-300">{seller.shopName[0]}</span>
              <div>
                <p className="text-xs text-ink-500">Sold by</p>
                <p className="flex items-center gap-1 font-semibold">{seller.shopName} {seller.verified && <BadgeCheck className="h-4 w-4 text-leaf-600" />}</p>
                <p className="text-xs text-ink-500">{seller.city} · ★ {seller.rating}</p>
              </div>
            </div>
            <Link to="/search" search={{ seller: seller.id }} className="text-sm font-semibold text-sindoor-600 hover:text-sindoor-700">Visit shop</Link>
          </div>

          <div className="mt-8">
            <div className="flex gap-6 border-b border-ink-900/10">
              {(['details', 'specs'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold ${tab === t ? 'border-sindoor-600 text-ink-900' : 'border-transparent text-ink-500'}`}>
                  {t === 'details' ? 'Description' : 'Specifications'}
                </button>
              ))}
            </div>
            {tab === 'details' ? (
              <p className="mt-4 leading-relaxed text-ink-700">{product.description}</p>
            ) : (
              <dl className="mt-4 divide-y divide-ink-900/5 rounded-xl bg-white text-sm ring-1 ring-ink-900/5">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-2.5">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-16 scroll-mt-44">
        <h2 className="font-display text-2xl font-extrabold">Ratings & reviews</h2>
        <div className="mt-5 grid gap-8 lg:grid-cols-[300px_1fr]">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-ink-900/5">
            <p className="font-display text-5xl font-extrabold">{product.rating.toFixed(1)}<span className="text-2xl text-ink-500">/5</span></p>
            <Stars rating={product.rating} size="h-5 w-5" />
            <p className="mt-1 text-sm text-ink-500">{product.ratingCount.toLocaleString('en-IN')} verified ratings</p>
            <div className="mt-5 space-y-2">
              {breakdown.map((b) => (
                <div key={b.star} className="flex items-center gap-2 text-xs">
                  <span className="w-6">{b.star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-dark">
                    <div className={`h-full rounded-full ${b.star >= 3 ? 'bg-leaf-600' : 'bg-sindoor-500'}`} style={{ width: `${b.share * 100}%` }} />
                  </div>
                  <span className="w-12 text-right text-ink-500">{b.count.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {reviews.map((r) => (
              <article key={r.id} className="rounded-2xl bg-white p-5 ring-1 ring-ink-900/5">
                <div className="flex items-center gap-3">
                  <RatingPill rating={r.rating} />
                  <h3 className="font-semibold">{r.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{r.body}</p>
                <p className="mt-3 flex items-center gap-2 text-xs text-ink-500">
                  {r.author} · {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {r.verifiedPurchase && <span className="inline-flex items-center gap-1 font-semibold text-leaf-600"><BadgeCheck className="h-3.5 w-3.5" /> Verified purchase</span>}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-extrabold">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function DeliveryCheck({ weightKg, price }: { weightKg: number; price: number }) {
  const { destination, setDestination } = useShop()
  const fee = shipmentDeliveryFee(price, weightKg, destination)
  return (
    <div className="mt-7 rounded-2xl bg-white p-4 ring-1 ring-ink-900/5">
      <div className="flex items-center gap-2 text-sm font-semibold"><Truck className="h-4 w-4 text-sindoor-600" /> Delivery</div>
      <select
        value={destination}
        onChange={(e) => setDestination(e.target.value as Destination)}
        className="mt-3 w-full rounded-xl bg-paper px-3 py-2.5 text-sm outline-none ring-1 ring-ink-900/10 focus:ring-sindoor-500"
        aria-label="Delivery destination"
      >
        {Object.entries(destinations).map(([k, d]) => <option key={k} value={k}>{d.label}</option>)}
      </select>
      <p className="mt-3 text-sm">
        Arrives in <span className="font-semibold">{destinations[destination].eta}</span> ·{' '}
        {fee === 0 ? <span className="font-semibold text-leaf-600">Free delivery</span> : <span>Delivery {npr(fee)}</span>}
      </p>
      {fee > 0 && <p className="mt-1 text-xs text-ink-500">Free delivery on orders above {npr(FREE_SHIPPING_THRESHOLD)} from this seller.</p>}
    </div>
  )
}
