import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { ShopProvider, useShop } from '@/lib/shop'

import '../styles.css'

const siteName = "JanakCart — Nepal's Multi-Vendor Marketplace"
const siteDescription = 'Shop electronics, fashion, home and Mithila handicrafts from verified sellers across Nepal. Cash on Delivery, eSewa and Khalti.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      { name: 'theme-color', content: '#c2321c' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-display text-7xl font-extrabold text-sindoor-600">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">We couldn’t find that page</h1>
      <p className="mt-2 text-ink-500">It may have moved, or the product is no longer listed.</p>
      <Link to="/" className="mt-8 inline-block rounded-full bg-ink-900 px-6 py-3 font-semibold text-paper">Back to shopping</Link>
    </div>
  )
}

function Toast() {
  const { toast } = useShop()
  if (!toast) return null
  return (
    <div role="status" className="animate-rise fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-paper shadow-xl">
      <CheckCircle2 className="h-4 w-4 text-marigold-300" /> {toast}
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        <ShopProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toast />
        </ShopProvider>
        <Scripts />
      </body>
    </html>
  )
}
