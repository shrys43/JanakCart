import { Link } from '@tanstack/react-router'
import { categories } from '@/data/fixtures'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-900 text-paper/80">
      <div className="mithila-border" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            JanakCart is a multi-vendor marketplace connecting shoppers with verified sellers across Nepal —
            from Kathmandu electronics shops to Janakpur’s Mithila artists.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {['Cash on Delivery', 'eSewa', 'Khalti'].map((m) => (
              <span key={m} className="rounded-md border border-paper/20 px-2.5 py-1 font-semibold">{m}</span>
            ))}
          </div>
        </div>
        <FooterCol title="Shop">
          {categories.slice(0, 6).map((c) => (
            <Link key={c.slug} to="/search" search={{ category: c.slug }} className="hover:text-white">{c.name}</Link>
          ))}
        </FooterCol>
        <FooterCol title="Help">
          <Link to="/help" className="hover:text-white">FAQs & support</Link>
          <Link to="/help" hash="returns" className="hover:text-white">Returns & refunds</Link>
          <Link to="/help" hash="shipping" className="hover:text-white">Shipping & delivery</Link>
          <Link to="/help" hash="privacy" className="hover:text-white">Privacy policy</Link>
        </FooterCol>
        <FooterCol title="Business">
          <Link to="/sell" className="hover:text-white">Sell on JanakCart</Link>
          <Link to="/sell" hash="fees" className="hover:text-white">Commission & fees</Link>
        </FooterCol>
      </div>
      <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/50">
        © {new Date().getFullYear()} JanakCart. Prices in Nepali Rupees, inclusive of 13% VAT.
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-sm font-bold uppercase tracking-wider text-marigold-300">{title}</h4>
      <div className="mt-4 flex flex-col gap-2.5 text-sm">{children}</div>
    </div>
  )
}
