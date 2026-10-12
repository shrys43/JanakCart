# AGENTS.md

Guidance for AI agents and developers working on **JanakCart**, a multi-vendor marketplace for Nepal.

**Start with [PLAN.md](./PLAN.md).** It records the architecture decisions and the numbered milestones.
Milestone 1 (the storefront surface) is done. Pick up the next unchecked milestone and keep each one deployable.

## Stack

TanStack Start (React 19, SSR) with TanStack Router file routes · TypeScript strict · Tailwind CSS 4 · Zod · lucide-react · Netlify.
Planned: Netlify Database (Postgres + Drizzle, `db/schema.ts`), Netlify Blobs, Netlify Functions for webhooks and scheduled jobs.

## Layout

```
src/
  data/fixtures.ts     # ALL stubbed data: categories, sellers, products, reviews, banners, coupons, commission rates
  lib/pricing.ts       # Pure cart pricing: per-seller shipments, delivery fees, coupons, VAT. Reuse on the server at checkout
  lib/shop.tsx         # ShopProvider: cart, wishlist, destination, coupon (localStorage) + toast
  lib/format.ts        # npr() currency formatting, cdn() Netlify Image CDN URLs
  components/          # Header, Footer, Logo, ProductCard, Stars/RatingPill
  routes/              # index, search, products/$productId, cart, wishlist, login, sell, help
public/img/            # Generated product photos & banners (always serve through cdn())
```

## Conventions

- Money is whole NPR in fixtures and the UI. Prices are **VAT-inclusive** (13%). When the database arrives, store integer paisa.
- Every screen reads data only through `src/data/fixtures.ts` helpers (`getProduct`, `getSeller`, …). Replacing those with server functions is how the stubs get swapped out.
- Pricing logic lives only in `src/lib/pricing.ts`. The server must recompute totals and never trust client totals.
- Images: never reference `/img/*.png` directly in `<img src>`. Use `cdn(src, width)`.
- Search params are validated with Zod in `routes/search.tsx`. Add new filters there.
- Theme tokens (`sindoor-*`, `marigold-*`, `ink-*`, `paper`, `leaf-*`) and fonts (`font-display` = Bricolage Grotesque, body = Figtree) are defined in `src/styles.css`.
- Components use PascalCase and live in `src/components`. Use the `@/` import alias.

## Non-obvious decisions

- The cart is split into **one parcel per seller**. Delivery fees are calculated per parcel: a zone base fee, plus a surcharge per kg over 2 kg, and free above Rs. 2,500.
- `/login` is a UI-only OTP walkthrough and sends no SMS. Real OTP must hash codes, expire them after 5 minutes, rate-limit requests, and never log the code.
- Payments must be verified server-to-server (eSewa status API, Khalti lookup). A browser redirect alone must never mark an order as paid.
- The Stripe code from the starter template was removed because Stripe doesn't serve Nepal. Gateways go behind an adapter interface (see PLAN.md milestone 5).
