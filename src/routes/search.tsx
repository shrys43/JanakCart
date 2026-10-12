import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { ProductCard } from '@/components/ProductCard'
import { categories, discountPercent, getCategory, products, sellers } from '@/data/fixtures'

const sortOptions = {
  relevance: 'Relevance',
  popular: 'Popularity',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  discount: 'Biggest discount',
  rating: 'Customer rating',
} as const

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(categories.map((c) => c.slug) as [string, ...string[]]).optional().catch(undefined),
  sort: z.enum(Object.keys(sortOptions) as [keyof typeof sortOptions]).optional().catch(undefined),
  min: z.coerce.number().int().nonnegative().optional().catch(undefined),
  max: z.coerce.number().int().positive().optional().catch(undefined),
  rating: z.coerce.number().min(1).max(5).optional().catch(undefined),
  seller: z.string().optional(),
  deals: z.coerce.boolean().optional().catch(undefined),
  inStock: z.coerce.boolean().optional().catch(undefined),
})

type SearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute('/search')({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: 'Search — JanakCart' }] }),
  component: SearchPage,
})

const priceBands = [
  { label: 'Under Rs. 1,000', max: 1000 },
  { label: 'Rs. 1,000 – 5,000', min: 1000, max: 5000 },
  { label: 'Rs. 5,000 – 20,000', min: 5000, max: 20000 },
  { label: 'Above Rs. 20,000', min: 20000 },
]

function SearchPage() {
  const params = Route.useSearch()
  const navigate = useNavigate({ from: '/search' })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const set = (patch: Partial<SearchParams>) => navigate({ search: (prev) => ({ ...prev, ...patch }) })

  const q = params.q?.toLowerCase().trim()
  let results = products.filter((p) => {
    if (q && ![p.name, p.brand, p.category, ...p.tags].some((t) => t.toLowerCase().includes(q))) return false
    if (params.category && p.category !== params.category) return false
    if (params.min !== undefined && p.price < params.min) return false
    if (params.max !== undefined && p.price > params.max) return false
    if (params.rating && p.rating < params.rating) return false
    if (params.seller && p.sellerId !== params.seller) return false
    if (params.deals && !p.isDeal) return false
    if (params.inStock && p.stock === 0) return false
    return true
  })
  const sorters: Record<keyof typeof sortOptions, (a: (typeof products)[0], b: (typeof products)[0]) => number> = {
    relevance: (a, b) => Number(b.stock > 0) - Number(a.stock > 0),
    popular: (a, b) => b.ratingCount - a.ratingCount,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    discount: (a, b) => discountPercent(b) - discountPercent(a),
    rating: (a, b) => b.rating - a.rating,
  }
  results = [...results].sort(sorters[params.sort ?? 'relevance'])

  const category = params.category ? getCategory(params.category) : undefined
  const heading = params.q ? `Results for “${params.q}”` : params.deals ? 'Today’s deals' : category?.name ?? 'All products'

  const chips: { label: string; clear: Partial<SearchParams> }[] = []
  if (params.q) chips.push({ label: `“${params.q}”`, clear: { q: undefined } })
  if (category) chips.push({ label: category.name, clear: { category: undefined } })
  if (params.min !== undefined || params.max !== undefined)
    chips.push({ label: `Rs. ${params.min ?? 0} – ${params.max ?? '∞'}`, clear: { min: undefined, max: undefined } })
  if (params.rating) chips.push({ label: `${params.rating}★ & above`, clear: { rating: undefined } })
  if (params.seller) chips.push({ label: sellers.find((s) => s.id === params.seller)?.shopName ?? 'Seller', clear: { seller: undefined } })
  if (params.deals) chips.push({ label: 'Deals', clear: { deals: undefined } })
  if (params.inStock) chips.push({ label: 'In stock', clear: { inStock: undefined } })

  const filters = (
    <div className="space-y-7 text-sm">
      <FilterGroup title="Category">
        <Radio checked={!params.category} onChange={() => set({ category: undefined })} label="All categories" />
        {categories.map((c) => (
          <Radio key={c.slug} checked={params.category === c.slug} onChange={() => set({ category: c.slug })} label={c.name} />
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        {priceBands.map((b) => (
          <Radio key={b.label} checked={params.min === b.min && params.max === b.max} onChange={() => set({ min: b.min, max: b.max })} label={b.label} />
        ))}
      </FilterGroup>
      <FilterGroup title="Customer rating">
        {[4.5, 4, 3].map((r) => (
          <Radio key={r} checked={params.rating === r} onChange={() => set({ rating: r })} label={`${r}★ & above`} />
        ))}
      </FilterGroup>
      <FilterGroup title="Seller">
        {sellers.map((s) => (
          <Check key={s.id} checked={params.seller === s.id} onChange={(v) => set({ seller: v ? s.id : undefined })} label={s.shopName} />
        ))}
      </FilterGroup>
      <FilterGroup title="More">
        <Check checked={!!params.deals} onChange={(v) => set({ deals: v || undefined })} label="Deals only" />
        <Check checked={!!params.inStock} onChange={(v) => set({ inStock: v || undefined })} label="Hide out-of-stock" />
      </FilterGroup>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="text-xs text-ink-500">
        <Link to="/" className="hover:text-ink-900">Home</Link> / <span className="text-ink-900">{heading}</span>
      </nav>

      <div className="mt-4 flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-44 rounded-2xl bg-white p-5 ring-1 ring-ink-900/5">
            <h2 className="mb-5 font-display text-lg font-bold">Filters</h2>
            {filters}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-extrabold">{heading}</h1>
              <p className="mt-1 text-sm text-ink-500">{results.length} {results.length === 1 ? 'product' : 'products'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-ink-900/10 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-ink-900/10">
                <span className="text-ink-500">Sort</span>
                <select
                  value={params.sort ?? 'relevance'}
                  onChange={(e) => set({ sort: e.target.value === 'relevance' ? undefined : (e.target.value as keyof typeof sortOptions) })}
                  className="bg-transparent font-semibold outline-none"
                >
                  {Object.entries(sortOptions).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button key={c.label} onClick={() => set(c.clear)} className="inline-flex items-center gap-1 rounded-full bg-sindoor-50 px-3 py-1 text-xs font-semibold text-sindoor-700 hover:bg-sindoor-100">
                  {c.label} <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <Link to="/search" className="px-2 py-1 text-xs font-semibold text-ink-500 hover:text-ink-900">Clear all</Link>
            </div>
          )}

          {results.length === 0 ? (
            <div className="mt-10 rounded-2xl bg-white p-12 text-center ring-1 ring-ink-900/5">
              <p className="font-display text-xl font-bold">No products match those filters</p>
              <p className="mt-2 text-sm text-ink-500">Try a different search term or remove a filter.</p>
              <Link to="/search" className="mt-6 inline-block rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper">Browse everything</Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setFiltersOpen(false)} />
          <div className="animate-rise absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X className="h-5 w-5" /></button>
            </div>
            {filters}
            <button onClick={() => setFiltersOpen(false)} className="mt-6 w-full rounded-full bg-sindoor-600 py-3 font-semibold text-white">
              Show {results.length} products
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-500">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  )
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-sindoor-600" />
      <span className={checked ? 'font-semibold' : ''}>{label}</span>
    </label>
  )
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded accent-sindoor-600" />
      <span className={checked ? 'font-semibold' : ''}>{label}</span>
    </label>
  )
}
