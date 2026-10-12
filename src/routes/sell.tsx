import { createFileRoute } from '@tanstack/react-router'
import { BadgeCheck, BarChart3, ClipboardCheck, PackageCheck, Store, Wallet } from 'lucide-react'
import { categories, commissionRates } from '@/data/fixtures'
import { npr } from '@/lib/format'

export const Route = createFileRoute('/sell')({
  head: () => ({ meta: [{ title: 'Sell on JanakCart' }] }),
  component: SellPage,
})

const steps = [
  { icon: Store, t: 'Register your shop', s: 'Mobile OTP sign-up, shop name and business address.' },
  { icon: ClipboardCheck, t: 'Verify your business', s: 'Upload PAN/VAT certificate and citizenship or company registration.' },
  { icon: BadgeCheck, t: 'Get approved', s: 'Our team reviews your documents, usually within 2 working days.' },
  { icon: PackageCheck, t: 'List & ship', s: 'Add products, receive orders, pack and hand over to our courier partners.' },
]

function SellPage() {
  const example = 10000
  const rate = commissionRates.fashion
  const commission = (example * rate) / 100
  return (
    <div>
      <section className="bg-ink-900 text-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-marigold-300">JanakCart Seller Hub</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">Your shop, open to every district in Nepal</h1>
            <p className="mt-4 max-w-lg text-paper/70">
              Whether you run an electronics store in New Road or paint Mithila art in Janakpur, JanakCart handles discovery,
              payments and delivery so you can focus on your products.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-marigold-400 px-6 py-3 font-semibold text-ink-900">Seller registration opens soon</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Wallet, t: 'Weekly payouts', s: 'Straight to your bank account' },
              { icon: BarChart3, t: 'Sales dashboard', s: 'Orders, earnings & stock alerts' },
              { icon: PackageCheck, t: 'Pickup from your door', s: 'Courier partners across Nepal' },
              { icon: BadgeCheck, t: 'Verified badge', s: 'Build trust with buyers' },
            ].map(({ icon: Icon, t, s }) => (
              <div key={t} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <Icon className="h-6 w-6 text-marigold-300" />
                <p className="mt-3 font-semibold">{t}</p>
                <p className="mt-1 text-sm text-paper/60">{s}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mithila-border" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-display text-3xl font-extrabold">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-4">
          {steps.map(({ icon: Icon, t, s }, i) => (
            <li key={t} className="rounded-2xl bg-white p-5 ring-1 ring-ink-900/5">
              <span className="font-display text-sm font-bold text-sindoor-600">Step {i + 1}</span>
              <Icon className="mt-3 h-6 w-6" />
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-ink-500">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="fees" className="mx-auto grid max-w-7xl scroll-mt-44 gap-8 px-4 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-extrabold">Simple, transparent commission</h2>
          <p className="mt-2 text-ink-500">Charged only on delivered orders. No listing fees. Delivery fees are passed to the courier.</p>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-ink-900/5">
            <table className="w-full text-sm">
              <thead className="bg-paper-dark text-left text-xs uppercase tracking-wider text-ink-500">
                <tr><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">Commission</th></tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {categories.map((c) => (
                  <tr key={c.slug}><td className="px-5 py-3">{c.name}</td><td className="px-5 py-3 text-right font-semibold">{commissionRates[c.slug]}%</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="self-start rounded-3xl bg-marigold-100 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sindoor-600">Example payout</p>
          <p className="mt-2 font-display text-xl font-bold">A delivered fashion order worth {npr(example)}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Order value (item price)</dt><dd className="font-semibold">{npr(example)}</dd></div>
            <div className="flex justify-between"><dt>Marketplace commission ({rate}%)</dt><dd className="font-semibold text-sindoor-700">− {npr(commission)}</dd></div>
            <div className="flex justify-between border-t border-ink-900/10 pt-3 text-base"><dt className="font-bold">You receive</dt><dd className="font-display text-2xl font-extrabold">{npr(example - commission)}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-ink-500">Payouts are released after the return window closes on each delivered order.</p>
        </div>
      </section>
    </div>
  )
}
