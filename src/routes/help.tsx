import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, LifeBuoy } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD, destinations } from '@/lib/pricing'
import { npr } from '@/lib/format'

export const Route = createFileRoute('/help')({
  head: () => ({ meta: [{ title: 'Help, returns & privacy — JanakCart' }] }),
  component: HelpPage,
})

const faqs = [
  { q: 'Which payment methods can I use?', a: 'Cash on Delivery is available everywhere we deliver. eSewa and Khalti wallets are being added. Your order is only marked paid after the payment provider confirms it to our servers.' },
  { q: 'Why did my order arrive in separate parcels?', a: 'JanakCart is a marketplace — each seller packs and ships their own items. Every parcel gets its own tracking number in your order history.' },
  { q: 'How do I track my order?', a: 'Each parcel moves through Confirmed → Packed → Shipped → Out for Delivery → Delivered. You’ll get an SMS at each step.' },
  { q: 'Can I cancel an order?', a: 'Yes, any time before the parcel is shipped. Prepaid orders are refunded to the original payment method.' },
]

function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sindoor-50 text-sindoor-600"><LifeBuoy className="h-6 w-6" /></span>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Help centre</h1>
          <p className="text-sm text-ink-500">Answers, policies and how to reach us</p>
        </div>
      </div>

      <section className="mt-8 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-2xl bg-white p-5 ring-1 ring-ink-900/5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              {f.q} <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{f.a}</p>
          </details>
        ))}
      </section>

      <Policy id="shipping" title="Shipping & delivery">
        <ul className="list-disc space-y-1 pl-5">
          {Object.values(destinations).map((d) => (
            <li key={d.label}>{d.label}: from {npr(d.base)}, usually {d.eta}</li>
          ))}
          <li>Free delivery on each seller parcel above {npr(FREE_SHIPPING_THRESHOLD)}.</li>
          <li>Parcels over 2 kg carry a small weight surcharge.</li>
        </ul>
      </Policy>
      <Policy id="returns" title="Returns, exchanges & refunds">
        <p>Most items can be returned or exchanged within 7 days of delivery if unused and in original packaging. Request a return from your order page and we’ll arrange a pickup. Refunds go back to the original payment method within 5–7 working days after the seller receives the item; Cash on Delivery orders are refunded to your eSewa/Khalti wallet or bank account. Groceries, beauty products and custom artwork are not returnable unless damaged or incorrect.</p>
      </Policy>
      <Policy id="privacy" title="Privacy policy">
        <p>We collect only what we need to deliver your orders: your name, mobile number and delivery addresses. Sellers see your delivery details only for orders they fulfil. We never store payment passwords, OTPs or card security codes — payments are handled directly by licensed gateways. You can ask us to export or delete your data at any time.</p>
      </Policy>
    </div>
  )
}

function Policy({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-44">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-ink-700">{children}</div>
    </section>
  )
}
