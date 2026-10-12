# JanakCart — Product Roadmap

JanakCart is a multi-vendor marketplace for Nepal: customers shop from many verified sellers in one cart,
sellers run their shops from a dashboard, and admins operate the marketplace. This roadmap breaks the full
product into small, shippable milestones. Each milestone leaves the site deployable and usable.

## Architecture (decided)

| Concern | Choice |
|---|---|
| App framework | TanStack Start (React 19 + TypeScript, SSR) on Netlify |
| API | TanStack Start server functions + `/api/*` server routes (webhooks, gateway callbacks) running as Netlify Functions |
| Database | Netlify Database (managed PostgreSQL) via `@netlify/database` + Drizzle ORM; schema in `db/schema.ts`, migrations generated at deploy |
| Files / product photos / KYC docs | Netlify Blobs (private store for KYC, public store served through Netlify Image CDN for product photos) |
| Auth | Mobile number + OTP. Codes are generated server-side, stored only as hashes with 5-min expiry and attempt limits, delivered by a Nepali SMS provider (Sparrow SMS or Aakash SMS). Sessions are HTTP-only, `Secure`, `SameSite=Lax` cookies backed by a `sessions` table. Admin accounts additionally require a password (argon2id) |
| Background work | Netlify background & scheduled functions (notifications, payout runs, stock-reservation expiry, payment reconciliation) |
| Payments | Gateway adapter interface (`initiate`, `verify`, `refund`) with COD, eSewa ePay v2 and Khalti KPG-2 adapters; more gateways plug into the same interface |
| Validation | Zod on every server function / route input |
| Tests | Vitest for pricing, inventory, commission, payment verification and order state machines |

## Milestones

### ✅ 1. Storefront surface (done)
Branded JanakCart storefront with stubbed catalog data in `src/data/fixtures.ts`:
homepage (banners, categories, deals with countdown, popular, recommendations, coupons, sellers),
search with filters & sorting, product pages (price/discount/stock/ratings/reviews/delivery estimate),
wishlist, multi-seller cart with quantity controls, coupons, per-parcel delivery fees and VAT display,
OTP sign-in screen (UI only), seller landing page with commission table, help/FAQ/returns/privacy pages.

### 2. Data model & catalog on Postgres
- Drizzle schema + migrations for: `users`, `addresses`, `sessions`, `otp_challenges`, `sellers`, `seller_documents`,
  `seller_payout_accounts`, `categories`, `products`, `product_images`, `inventory` (on-hand / reserved),
  `carts`, `cart_items`, `wishlists`, `coupons`, `coupon_redemptions`, `reviews`, `banners`,
  `orders`, `seller_orders` (sub-orders), `order_items`, `payments`, `payment_events`, `refunds`,
  `commission_rules`, `commissions`, `payouts`, `payout_items`, `shipments`, `tracking_events`,
  `delivery_rules`, `cod_remittances`, `returns`, `notifications`, `support_tickets`, `ticket_messages`,
  `reported_products`, `admin_roles`, `admin_users`, `audit_logs`.
- Constraints: FK everywhere, `CHECK (stock_on_hand >= 0 AND reserved >= 0)`, unique SKU per seller,
  unique `(gateway, gateway_txn_id)`, unique `idempotency_key` on payments, money stored as integer paisa.
- Indexes on product search columns (`pg_trgm` on name/brand), `seller_id`, `status`, `created_at`.
- Seed script with demo customers, sellers, admin and the current fixture catalog.
- Swap `src/data/fixtures.ts` reads for server functions; product photos move to Netlify Blobs.

### 3. Customer accounts (OTP)
- Request/verify OTP server functions with per-number and per-IP rate limits, hashed codes, lockout.
- SMS provider adapter (Sparrow/Aakash) — **requires provider account + API token**.
- Profile, saved addresses (province / district / municipality / ward), account settings.
- Cart & wishlist sync from local storage to the database on sign-in. CSRF protection on mutations.

### 4. Checkout & orders (COD first)
- Checkout: address selection, server-side re-pricing via `src/lib/pricing.ts`, coupon validation.
- Single DB transaction: create `order` + one `seller_order` per seller + `order_items`, reserve stock
  with `SELECT … FOR UPDATE` / conditional `UPDATE … WHERE available >= qty`, reject unavailable quantities.
- Unique human order IDs (e.g. `JC-2610-8F3K2`) and payment transaction IDs.
- Separate payment / fulfilment / delivery statuses; order confirmation page and printable VAT invoice.
- Order history; cancellation before dispatch with stock restoration.

### 5. Online payments (eSewa, Khalti)
- eSewa ePay v2: HMAC-SHA256 signed form, verify by **server-side status-check API**, never trust redirect params.
- Khalti KPG-2: server-side `initiate` → redirect → server-side `lookup` by `pidx`.
- Idempotent processing (row lock on payment + unique gateway txn id), pending/failed/cancelled handling,
  scheduled reconciliation for stuck pending payments, full `payment_events` log, refunds where the gateway supports them.
- Sandbox credentials first; **live mode requires merchant agreements with eSewa and Khalti**.

### 6. Seller dashboard
- Seller sign-up, shop & business info, PAN/VAT + ID document upload (private Blobs), payout bank details.
- Admin approval gate; product CRUD with photos, SKU, categories, stock; listings go to moderation.
- Incoming orders: accept → pack → dispatch (tracking number), handle cancellations & returns.
- Inventory with low-stock alerts; sales reports; earnings, commission deductions, payout history.

### 7. Shipping & delivery
- Delivery rules table (zone/weight/free threshold) editable by admin, replacing the constants in `pricing.ts`.
- Courier adapter interface with manual adapter first (seller/admin enters status + tracking no.);
  API adapters for Nepali couriers (e.g. Pathao, NCM) **require courier business accounts**.
- Shipping label PDF, tracking timeline: Confirmed → Packed → Shipped → Out for Delivery → Delivered.
- Delivery failures, reverse pickup for returns, COD collection & remittance reconciliation.

### 8. Commissions & payouts
- Configurable commission rules (global → category → seller override).
- On delivery + return-window close: compute commission and seller earning per item in a transaction.
- Scheduled weekly payout batches, payout statements, adjustments for refunds.

### 9. Admin dashboard
- Admin login (password + OTP), role-based permissions (super admin, operations, finance, support, catalog).
- Manage customers, sellers (approve/reject), products (moderate), categories, banners, offers, coupons.
- Orders, payments, refunds, returns, complaints, reviews, reported products.
- Commission, delivery-charge and promotion settings; revenue/commission/payout reports; CSV export.
- Append-only audit log for every admin action.

### 10. Notifications & support
- Notification service: SMS (order + status updates), email (invoice), in-app; seller new-order alerts.
- Support tickets with threaded messages, FAQ management, complaint workflow.

### 11. Hardening & launch
- Automated tests: checkout, payment verification, inventory reservation, commissions, order tracking.
- Security review (headers/CSP, rate limits, access-control tests), error logging & monitoring,
  database backups, `.env.example`, deployment & production-readiness checklist, API documentation.

## External setup required before launch
- SMS/OTP provider account (Sparrow SMS or Aakash SMS) and approved sender ID.
- eSewa and Khalti merchant accounts (sandbox keys first, live keys after business approval).
- Courier partner business accounts for API integration (manual updates work without them).
- Registered business (PAN/VAT) for issuing tax invoices.
