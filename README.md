# JanakCart

JanakCart is a multi-vendor e-commerce marketplace for Nepal. Shoppers can browse products from many verified
sellers, from Kathmandu electronics shops to Mithila artists in Janakpur, and check out with one cart. Each
seller ships their own parcel.

## What's live now

- **Homepage**: rotating festive banners, category grid, "Deals of the day" with a countdown, popular products,
  coupon offers, personalised recommendations, a Made-in-Nepal spotlight and verified sellers.
- **Search & browse** (`/search`): keyword search, category, price, rating, seller, deals and stock filters, plus six sort orders.
- **Product page** (`/products/:id`): photo, price, MRP and discount, stock level, quantity picker, highlights,
  specifications, seller card, delivery estimate by destination, rating breakdown and reviews.
- **Cart** (`/cart`): items grouped into one parcel per seller, quantity controls, save for later, coupons
  (`JANAK10`, `DASHAIN500`, `FREESHIP`), per-parcel delivery fees, the VAT included in the total, and savings.
- **Wishlist**, **mobile OTP sign-in screen** (UI only for now), **Sell on JanakCart** page with the commission table, and a **Help** page with FAQs and the shipping, returns and privacy policies.

Catalog data is stubbed in `src/data/fixtures.ts`. The cart and wishlist are saved in the browser.

## Tech stack

- TanStack Start (React 19, TypeScript, SSR) and TanStack Router
- Tailwind CSS 4 with a custom JanakCart theme (sindoor red, marigold, Mithila ink)
- Netlify hosting and the Netlify Image CDN for product photos
- Planned: Netlify Database (Postgres and Drizzle), Netlify Blobs, and eSewa and Khalti payment integrations

## Running locally

```bash
pnpm install
netlify dev        # or: pnpm dev  (http://localhost:3000)
```

## Roadmap

[PLAN.md](./PLAN.md) has the full plan. In order, the next milestones are:

1. Postgres data model and catalog
2. OTP customer accounts
3. Checkout and orders, with Cash on Delivery first
4. eSewa and Khalti payments
5. Seller dashboard
6. Shipping and tracking
7. Commissions and payouts
8. Admin dashboard
9. Notifications and support
10. Hardening, tests and launch

Some features need external accounts before they can go live: an SMS provider, eSewa and Khalti merchant
accounts, and courier APIs. PLAN.md lists these.
