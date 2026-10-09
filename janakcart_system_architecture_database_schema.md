# JanakCart Architecture & Specification: Multi-Vendor Marketplace for Nepal

## 1. System Overview & Technology Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, TanStack Query, Lucide Icons.
- **Backend API**: Node.js with NestJS or Express TypeScript with Prisma ORM.
- **Database**: PostgreSQL 16 (with relational constraints, row-level locking for inventory, audit logging).
- **Cache & Message Queue**: Redis + BullMQ (asynchronous SMS OTP dispatch, courier webhooks, notification engine).
- **Media Storage**: Cloudflare R2 / AWS S3 with signed upload URLs.
- **Payment Gateway Integrations**:
  - **eSewa EPAY v2**: Server-to-server transaction verification HMAC-SHA256 signature validation.
  - **Khalti ePayment API v2**: `epayment/initiate/` & `epayment/lookup/` with secret key verification.
  - **Fonepay Merchant QR**: Dynamic QR string generation & webhook listener.
  - **Cash on Delivery (COD)**: With SMS OTP delivery verification PIN.
- **SMS Gateway**: Sparrow SMS / Aakash SMS API for Nepal OTP delivery and order dispatch alerts.

---

## 2. Core Database Relational Schema (PostgreSQL DDL Summary)

```sql
-- 1. Users & Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(150),
    role VARCHAR(20) DEFAULT 'CUSTOMER', -- 'CUSTOMER', 'SELLER', 'ADMIN'
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL, -- 'Bagmati', 'Gandaki', 'Koshi', etc.
    district VARCHAR(50) NOT NULL, -- 'Kathmandu', 'Lalitpur', 'Kaski', etc.
    municipality_ward VARCHAR(100) NOT NULL, -- 'Ward 3, New Baneshwor'
    street_address TEXT NOT NULL,
    landmark TEXT,
    is_default BOOLEAN DEFAULT FALSE
);

-- 2. Sellers & Shops
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    shop_name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    pan_vat_number VARCHAR(50) NOT NULL,
    citizenship_or_reg_doc TEXT NOT NULL,
    bank_name VARCHAR(100),
    bank_acc_number VARCHAR(50),
    bank_routing_branch VARCHAR(100),
    commission_rate_percentage NUMERIC(5,2) DEFAULT 8.00,
    verification_status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products & Inventory
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INT REFERENCES categories(id)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    nta_approved BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- 'DRAFT', 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    variant_name VARCHAR(150) NOT NULL, -- '128GB - Celadon Marble'
    mrp_npr NUMERIC(12,2) NOT NULL,
    selling_price_npr NUMERIC(12,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    images JSONB NOT NULL DEFAULT '[]'
);

-- 4. Multi-Vendor Orders & Seller Sub-Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(50) UNIQUE NOT NULL, -- 'JC-NP-9842109'
    customer_id UUID REFERENCES users(id),
    address_id UUID REFERENCES addresses(id),
    total_mrp NUMERIC(12,2) NOT NULL,
    total_discount NUMERIC(12,2) DEFAULT 0,
    delivery_fee NUMERIC(12,2) DEFAULT 0,
    total_payable NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'ESEWA', 'KHALTI', 'FONEPAY', 'COD'
    payment_status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED'
    handover_otp VARCHAR(6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sub_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES sellers(id),
    sub_order_code VARCHAR(60) UNIQUE NOT NULL,
    subtotal_npr NUMERIC(12,2) NOT NULL,
    commission_rate NUMERIC(5,2) NOT NULL,
    marketplace_commission_npr NUMERIC(12,2) NOT NULL,
    seller_payout_npr NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'
    tracking_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_order_id UUID REFERENCES sub_orders(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES product_variants(id),
    unit_price_npr NUMERIC(12,2) NOT NULL,
    quantity INT NOT NULL,
    total_npr NUMERIC(12,2) NOT NULL
);

-- 5. Payments & Telemetry
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    gateway VARCHAR(30) NOT NULL,
    gateway_ref_id VARCHAR(100),
    amount_npr NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    payload_response JSONB,
    verified_at TIMESTAMP WITH TIME ZONE
);
```

---

## 3. Nepal Payment Gateway Verification Flow

### A. eSewa (EPAY v2) Server Verification
1. Customer clicks "Pay via eSewa" (`रू 40,888`).
2. Backend generates signature using merchant secret key:
   `hash = HMAC_SHA256("total_amount,transaction_uuid,product_code", SECRET_KEY)`
3. Customer completes payment on eSewa; returns with base64 encoded token.
4. **Backend Server-to-Server Verification (Crucial)**:
   Backend queries eSewa lookup endpoint:
   `GET https://rc.esewa.com.np/api/epay/transaction/status/?product_code=...&total_amount=...&transaction_uuid=...`
5. On `status: "COMPLETE"`, update `payment_status = 'PAID'` and sub-orders to `CONFIRMED`.

### B. Khalti v2 Server Verification
1. Call `POST https://khalti.com/api/v2/epayment/initiate/` with `return_url`, `purchase_order_id`, `amount` in paisa.
2. Receive `payment_url` and `pidx`. Redirect buyer.
3. Upon return, server executes lookup:
   `POST https://khalti.com/api/v2/epayment/lookup/` with header `Authorization: Key <secret_key>` and body `{"pidx": "..."}`.
4. Only when status is `Completed`, record settlement in `payment_transactions`.
