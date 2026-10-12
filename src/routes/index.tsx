import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, RotateCcw, ShieldCheck, Truck, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { banners, categories, coupons, getProduct, products, sellers } from '@/data/fixtures'
import { cdn } from '@/lib/format'
import { useShop } from '@/lib/shop'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const deals = products.filter((p) => p.isDeal)
  const popular = [...products].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 8)
  const crafts = products.filter((p) => p.category === 'handicrafts' || p.sellerId === 's-dhaka' || p.sellerId === 's-pahad').slice(0, 4)

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 ring-1 ring-ink-900/5 md:grid-cols-4">
          {[
            { icon: Wallet, t: 'Cash on Delivery', s: 'Pay when it arrives' },
            { icon: BadgeCheck, t: 'Verified sellers', s: 'Every shop KYC-checked' },
            { icon: Truck, t: 'Split shipments', s: 'Track each seller’s parcel' },
            { icon: RotateCcw, t: '7-day returns', s: 'Easy pickup from home' },
          ].map(({ icon: Icon, t, s }) => (
            <div key={t} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sindoor-50 text-sindoor-600"><Icon className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-xs text-ink-500">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Section title="Shop by category" action={<SeeAll to="/search" />}>
        <div className="grid grid-cols-4 gap-3 sm:gap-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link key={c.slug} to="/search" search={{ category: c.slug }} className="group text-center">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-ink-900/5 transition group-hover:ring-2 group-hover:ring-sindoor-500">
                <img src={cdn(c.image, 200)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              </div>
              <p className="mt-2 text-xs font-semibold sm:text-sm">{c.name}</p>
              <p className="hidden text-xs text-ink-500 sm:block">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </Section>

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl bg-sindoor-600 text-white">
          <div className="flex flex-wrap items-end justify-between gap-4 px-5 pb-4 pt-6 sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-marigold-300">Deals of the day</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Festive prices, ending tonight</h2>
            </div>
            <Countdown />
          </div>
          <div className="scrollbar-none flex gap-4 overflow-x-auto px-5 pb-6 sm:px-8">
            {deals.map((p) => (
              <div key={p.id} className="w-44 shrink-0 text-ink-900 sm:w-52">
                <ProductCard product={p} compact />
              </div>
            ))}
            <Link
              to="/search"
              search={{ deals: true }}
              className="grid w-44 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-white/40 text-center font-semibold hover:bg-white/10 sm:w-52"
            >
              <span>View all deals <ArrowRight className="mx-auto mt-2 h-5 w-5" /></span>
            </Link>
          </div>
        </div>
      </section>

      <Section title="Popular right now" subtitle="Most-loved by JanakCart shoppers this week" action={<SeeAll to="/search" sort="popular" />}>
        <Grid>{popular.map((p) => <ProductCard key={p.id} product={p} />)}</Grid>
      </Section>

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {coupons.map((c, i) => (
            <div key={c.code} className={`relative overflow-hidden rounded-2xl p-5 ${i === 0 ? 'bg-marigold-400' : i === 1 ? 'bg-ink-900 text-paper' : 'bg-leaf-50 ring-1 ring-leaf-600/20'}`}>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Use code</p>
              <p className="mt-1 font-display text-2xl font-extrabold tracking-wide">{c.code}</p>
              <p className="mt-1 text-sm opacity-90">{c.label}</p>
              <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full border-[10px] border-current opacity-10" />
            </div>
          ))}
        </div>
      </section>

      <Recommended />

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-paper-dark lg:grid-cols-2">
          <img src={cdn('/img/banner-mithila.png', 900)} alt="Mithila painting, singing bowl and Dhaka fabric" loading="lazy" className="h-full max-h-96 w-full object-cover" />
          <div className="p-6 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sindoor-600">Made in Nepal</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight">From Janakpur’s courtyards to your doorstep</h2>
            <p className="mt-3 text-ink-700">
              Our artisan sellers paint, weave and hammer every piece by hand. A larger share of each sale goes straight to the maker.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {crafts.map((p) => (
                <Link key={p.id} to="/products/$productId" params={{ productId: p.id }} className="flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-ink-900/5 hover:ring-sindoor-500">
                  <img src={cdn(p.image, 96)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="line-clamp-2 text-xs font-medium">{p.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section title="Shops you can trust" subtitle="Every seller is identity-verified and approved by our team">
        <div className="scrollbar-none flex gap-3 overflow-x-auto">
          {sellers.map((s) => (
            <div key={s.id} className="w-60 shrink-0 rounded-2xl bg-white p-4 ring-1 ring-ink-900/5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ink-900 font-display text-lg font-bold text-marigold-300">
                  {s.shopName[0]}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{s.shopName}</p>
                  <p className="text-xs text-ink-500">{s.city}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-leaf-600"><ShieldCheck className="h-4 w-4" /> Verified</span>
                <span className="text-ink-500">★ {s.rating} seller rating</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink-900 p-8 text-paper md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Have something to sell? Reach all of Nepal.</h2>
            <p className="mt-2 max-w-xl text-paper/70">List products, manage orders and get weekly payouts. Commission starts at just 5%.</p>
          </div>
          <Link to="/sell" className="shrink-0 rounded-full bg-marigold-400 px-6 py-3 font-semibold text-ink-900 hover:bg-marigold-300">
            Start selling
          </Link>
        </div>
      </section>
    </div>
  )
}

function Hero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % banners.length), 6000)
    return () => clearInterval(t)
  }, [])
  const go = (d: number) => setI((n) => (n + d + banners.length) % banners.length)

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 pt-4">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {banners.map((b, idx) => (
            <div key={b.id} className="relative h-[420px] w-full shrink-0 sm:h-[440px]" aria-hidden={idx !== i}>
              <img
                src={cdn(b.image, 1600)}
                srcSet={`${cdn(b.image, 800)} 800w, ${cdn(b.image, 1600)} 1600w`}
                sizes="(max-width: 1280px) 100vw, 1280px"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
              />
              <div
                className={`absolute inset-0 ${
                  b.theme === 'vermilion'
                    ? 'bg-gradient-to-t from-sindoor-900/90 via-sindoor-900/40 to-transparent md:bg-gradient-to-l md:from-sindoor-900/80 md:via-sindoor-700/30'
                    : 'bg-gradient-to-t from-paper via-paper/70 to-transparent md:bg-gradient-to-r md:from-paper/95 md:via-paper/60'
                }`}
              />
              <div className={`relative flex h-full items-end p-6 sm:p-10 md:items-center ${b.theme === 'vermilion' ? 'md:justify-end' : ''}`}>
                <div className={`max-w-md ${b.theme === 'vermilion' ? 'text-white' : 'text-ink-900'}`}>
                  <p className={`text-xs font-bold uppercase tracking-[0.22em] ${b.theme === 'vermilion' ? 'text-marigold-300' : 'text-sindoor-600'}`}>{b.eyebrow}</p>
                  <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">{b.title}</h1>
                  <p className={`mt-3 text-sm sm:text-base ${b.theme === 'vermilion' ? 'text-white/85' : 'text-ink-700'}`}>{b.subtitle}</p>
                  <a
                    href={b.href}
                    className={`mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ${
                      b.theme === 'vermilion' ? 'bg-marigold-400 text-ink-900 hover:bg-marigold-300' : 'bg-sindoor-600 text-white hover:bg-sindoor-700'
                    }`}
                  >
                    {b.cta} <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((b, idx) => (
            <button key={b.id} onClick={() => setI(idx)} aria-label={`Show banner ${idx + 1}`} className={`h-2 rounded-full transition-all ${idx === i ? 'w-8 bg-marigold-400' : 'w-2 bg-white/70'}`} />
          ))}
        </div>
        <button onClick={() => go(-1)} aria-label="Previous banner" className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink-900 hover:bg-white sm:grid"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => go(1)} aria-label="Next banner" className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink-900 hover:bg-white sm:grid"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </section>
  )
}

function Countdown() {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const end = new Date(now)
      end.setHours(24, 0, 0, 0)
      setLeft(Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])
  const parts = left === null ? ['--', '--', '--'] : [left / 3600, (left % 3600) / 60, left % 60].map((n) => String(Math.floor(n)).padStart(2, '0'))
  return (
    <div className="flex items-center gap-1.5 font-display text-lg font-bold" aria-label="Time left for today's deals">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="rounded-lg bg-ink-900 px-2.5 py-1 tabular-nums text-marigold-300">{p}</span>
          {i < 2 && <span>:</span>}
        </span>
      ))}
    </div>
  )
}

function Recommended() {
  const { cart, wishlist, hydrated } = useShop()
  const items = useMemo(() => {
    const seen = new Set([...cart.map((l) => l.productId), ...wishlist])
    const cats = new Set([...seen].map((id) => getProduct(id)?.category).filter(Boolean))
    const pool = products.filter((p) => !seen.has(p.id) && p.stock > 0)
    const ranked = cats.size ? [...pool.filter((p) => cats.has(p.category)), ...pool.filter((p) => !cats.has(p.category))] : [...pool].sort((a, b) => b.rating - a.rating)
    return ranked.slice(0, 4)
  }, [cart, wishlist])
  const personal = hydrated && cart.length + wishlist.length > 0

  return (
    <Section title={personal ? 'Recommended for you' : 'Top rated picks'} subtitle={personal ? 'Based on your cart and wishlist' : 'Highest-rated items across every category'}>
      <Grid>{items.map((p) => <ProductCard key={p.id} product={p} />)}</Grid>
    </Section>
  )
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-14 max-w-7xl px-4">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{children}</div>
}

function SeeAll({ to, sort }: { to: '/search'; sort?: 'popular' }) {
  return (
    <Link to={to} search={sort ? { sort } : {}} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-sindoor-600 hover:text-sindoor-700">
      See all <ArrowRight className="h-4 w-4" />
    </Link>
  )
}
