import { Link, createFileRoute } from '@tanstack/react-router'
import { BadgeCheck, Heart, Lock, Minus, Package, Plus, Tag, Trash2, Truck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { coupons } from '@/data/fixtures'
import { cdn, npr } from '@/lib/format'
import { computeTotals, destinations, FREE_SHIPPING_THRESHOLD, type Destination } from '@/lib/pricing'
import { useShop } from '@/lib/shop'

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [{ title: 'Your cart — JanakCart' }] }),
  component: CartPage,
})

function CartPage() {
  const shop = useShop()
  const totals = computeTotals(shop.cart, shop.destination, shop.couponCode || undefined)
  const [code, setCode] = useState('')

  const apply = (e: FormEvent) => {
    e.preventDefault()
    if (code.trim()) shop.setCouponCode(code.trim().toUpperCase())
    setCode('')
  }

  if (!shop.hydrated) return <div className="mx-auto max-w-7xl px-4 py-24 text-center text-ink-500">Loading your cart…</div>

  if (totals.itemCount === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sindoor-50 text-sindoor-600"><Package className="h-9 w-9" /></div>
        <h1 className="mt-6 font-display text-3xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-ink-500">Discover festive deals, Mithila art and everyday essentials from verified Nepali sellers.</p>
        <Link to="/" className="mt-8 inline-block rounded-full bg-sindoor-600 px-6 py-3 font-semibold text-white hover:bg-sindoor-700">Start shopping</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">Your cart <span className="text-ink-500">({totals.itemCount})</span></h1>
      {totals.shipments.length > 1 && (
        <p className="mt-1 text-sm text-ink-500">Items from {totals.shipments.length} sellers ship as separate parcels — you can track each one.</p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink-900/5">
            <Truck className="h-5 w-5 text-sindoor-600" />
            <span className="text-sm font-semibold">Deliver to</span>
            <select
              value={shop.destination}
              onChange={(e) => shop.setDestination(e.target.value as Destination)}
              className="flex-1 rounded-xl bg-paper px-3 py-2 text-sm outline-none ring-1 ring-ink-900/10"
              aria-label="Delivery destination"
            >
              {Object.entries(destinations).map(([k, d]) => <option key={k} value={k}>{d.label} · {d.eta}</option>)}
            </select>
          </div>

          {totals.shipments.map((s, idx) => {
            const toFree = FREE_SHIPPING_THRESHOLD - s.subtotal
            return (
              <section key={s.sellerId} className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-900/5">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-900/5 bg-paper/60 px-5 py-3">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="rounded-md bg-ink-900 px-2 py-0.5 text-xs font-bold text-marigold-300">Parcel {idx + 1}</span>
                    <span className="font-semibold">{s.sellerName}</span>
                    <BadgeCheck className="h-4 w-4 text-leaf-600" />
                  </p>
                  <p className="text-xs">
                    {s.deliveryFee === 0 ? (
                      <span className="font-semibold text-leaf-600">Free delivery</span>
                    ) : (
                      <span className="text-ink-500">Delivery {npr(s.deliveryFee)} · add {npr(toFree)} for free delivery</span>
                    )}
                  </p>
                </header>
                <ul className="divide-y divide-ink-900/5">
                  {s.lines.map(({ product, qty, lineTotal }) => (
                    <li key={product.id} className="flex gap-4 p-5">
                      <Link to="/products/$productId" params={{ productId: product.id }} className="shrink-0">
                        <img src={cdn(product.image, 200)} alt={product.name} className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to="/products/$productId" params={{ productId: product.id }} className="line-clamp-2 font-medium hover:text-sindoor-600">{product.name}</Link>
                        <p className="mt-0.5 text-xs text-ink-500">{product.brand}{product.stock <= 10 && ` · only ${product.stock} left`}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-bold">{npr(lineTotal)}</span>
                          {qty > 1 && <span className="text-xs text-ink-500">{npr(product.price)} each</span>}
                          <span className="text-xs text-ink-500 line-through">{npr(product.mrp * qty)}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <div className="flex items-center rounded-full ring-1 ring-ink-900/10">
                            <button onClick={() => shop.setQty(product.id, qty - 1)} className="grid h-8 w-8 place-items-center" aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-7 text-center text-sm font-semibold tabular-nums">{qty}</span>
                            <button onClick={() => shop.setQty(product.id, qty + 1)} disabled={qty >= Math.min(product.stock, 10)} className="grid h-8 w-8 place-items-center disabled:opacity-30" aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <button
                            onClick={() => {
                              if (!shop.isWishlisted(product.id)) shop.toggleWishlist(product.id)
                              shop.removeFromCart(product.id)
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-900"
                          >
                            <Heart className="h-3.5 w-3.5" /> Save for later
                          </button>
                          <button onClick={() => shop.removeFromCart(product.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-sindoor-600">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>

        <aside className="lg:sticky lg:top-44 lg:self-start">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-ink-900/5">
            <h2 className="flex items-center gap-2 font-semibold"><Tag className="h-4 w-4 text-sindoor-600" /> Coupons</h2>
            {totals.coupon ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-leaf-50 px-3 py-2.5 text-sm">
                <span><span className="font-bold text-leaf-600">{totals.coupon.code}</span> applied</span>
                <button onClick={() => shop.setCouponCode('')} className="text-xs font-semibold text-ink-500 hover:text-ink-900">Remove</button>
              </div>
            ) : (
              <>
                <form onSubmit={apply} className="mt-3 flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code" className="min-w-0 flex-1 rounded-xl bg-paper px-3 py-2.5 text-sm uppercase outline-none ring-1 ring-ink-900/10 focus:ring-sindoor-500" />
                  <button className="rounded-xl bg-ink-900 px-4 text-sm font-semibold text-paper">Apply</button>
                </form>
                {totals.couponError && shop.couponCode && (
                  <p className="mt-2 flex items-center justify-between text-xs text-sindoor-700">
                    {totals.couponError}
                    <button onClick={() => shop.setCouponCode('')} className="ml-2 font-semibold underline">Clear</button>
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {coupons.map((c) => (
                    <button key={c.code} onClick={() => shop.setCouponCode(c.code)} title={c.label} className="rounded-lg border border-dashed border-sindoor-500 px-2.5 py-1 text-xs font-bold text-sindoor-600 hover:bg-sindoor-50">
                      {c.code}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-ink-900/5">
            <h2 className="font-semibold">Price details</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label={`Price (${totals.itemCount} items)`} value={npr(totals.mrpTotal)} />
              <Row label="Discount on MRP" value={`− ${npr(totals.productSavings)}`} accent />
              <Row label={`Delivery (${totals.shipments.length} ${totals.shipments.length === 1 ? 'parcel' : 'parcels'})`} value={totals.deliveryFee === 0 ? 'Free' : npr(totals.deliveryFee)} accent={totals.deliveryFee === 0} />
              {totals.couponDiscount > 0 && <Row label={`Coupon ${totals.coupon?.code}`} value={`− ${npr(totals.couponDiscount)}`} accent />}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-ink-900/15 pt-4">
              <span className="font-display text-lg font-bold">Total</span>
              <span className="font-display text-2xl font-extrabold">{npr(totals.total)}</span>
            </div>
            <p className="mt-1 text-right text-xs text-ink-500">Includes {npr(totals.vatIncluded)} VAT (13%)</p>
            <p className="mt-4 rounded-xl bg-leaf-50 px-3 py-2 text-sm font-semibold text-leaf-600">
              You save {npr(totals.productSavings + totals.couponDiscount)} on this order
            </p>
            <Link to="/login" search={{ next: 'checkout' }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-sindoor-600 py-3.5 font-semibold text-white hover:bg-sindoor-700">
              <Lock className="h-4 w-4" /> Proceed to checkout
            </Link>
            <p className="mt-3 text-center text-xs text-ink-500">Cash on Delivery · eSewa · Khalti</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-700">{label}</dt>
      <dd className={accent ? 'font-semibold text-leaf-600' : 'font-medium'}>{value}</dd>
    </div>
  )
}
