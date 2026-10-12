import { coupons, getProduct, getSeller, type Coupon, type Product } from '@/data/fixtures'

/**
 * Cart pricing rules. Pure functions so the same logic can run on the server
 * at checkout (the server must always recompute — never trust client totals).
 */

export type Destination = 'kathmandu-valley' | 'major-city' | 'remote'

export const destinations: Record<Destination, { label: string; base: number; eta: string }> = {
  'kathmandu-valley': { label: 'Kathmandu Valley', base: 100, eta: '1–2 days' },
  'major-city': { label: 'Pokhara, Biratnagar, Janakpur & other cities', base: 150, eta: '2–4 days' },
  remote: { label: 'Other districts', base: 250, eta: '4–7 days' },
}

/** Each seller shipment ships free above this subtotal. */
export const FREE_SHIPPING_THRESHOLD = 2500
/** Weight included in the base fee; each extra kg (or part) adds PER_KG. */
export const BASE_WEIGHT_KG = 2
export const PER_KG = 40
/** Nepal VAT. Listed prices are VAT-inclusive; we show the included share. */
export const VAT_RATE = 0.13

export interface CartLine {
  productId: string
  qty: number
}

export interface Shipment {
  sellerId: string
  sellerName: string
  lines: { product: Product; qty: number; lineTotal: number }[]
  subtotal: number
  weightKg: number
  deliveryFee: number
}

export interface CartTotals {
  shipments: Shipment[]
  itemCount: number
  mrpTotal: number
  subtotal: number
  productSavings: number
  deliveryFee: number
  couponDiscount: number
  coupon?: Coupon
  couponError?: string
  total: number
  vatIncluded: number
}

export function shipmentDeliveryFee(subtotal: number, weightKg: number, dest: Destination) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  const extraKg = Math.max(0, Math.ceil(weightKg - BASE_WEIGHT_KG))
  return destinations[dest].base + extraKg * PER_KG
}

export function findCoupon(code: string) {
  return coupons.find((c) => c.code === code.trim().toUpperCase())
}

export function computeTotals(lines: CartLine[], dest: Destination, couponCode?: string): CartTotals {
  const bySeller = new Map<string, Shipment>()
  let itemCount = 0
  let mrpTotal = 0

  for (const line of lines) {
    const product = getProduct(line.productId)
    if (!product || line.qty <= 0) continue
    const qty = Math.min(line.qty, product.stock)
    if (qty === 0) continue
    itemCount += qty
    mrpTotal += product.mrp * qty
    let s = bySeller.get(product.sellerId)
    if (!s) {
      s = { sellerId: product.sellerId, sellerName: getSeller(product.sellerId)?.shopName ?? 'Seller', lines: [], subtotal: 0, weightKg: 0, deliveryFee: 0 }
      bySeller.set(product.sellerId, s)
    }
    s.lines.push({ product, qty, lineTotal: product.price * qty })
    s.subtotal += product.price * qty
    s.weightKg += product.weightKg * qty
  }

  const shipments = [...bySeller.values()]
  for (const s of shipments) s.deliveryFee = shipmentDeliveryFee(s.subtotal, s.weightKg, dest)

  const subtotal = shipments.reduce((a, s) => a + s.subtotal, 0)
  const deliveryFee = shipments.reduce((a, s) => a + s.deliveryFee, 0)

  let coupon: Coupon | undefined
  let couponError: string | undefined
  let couponDiscount = 0
  if (couponCode) {
    const c = findCoupon(couponCode)
    if (!c) couponError = 'This coupon code is not valid.'
    else if (subtotal < c.minOrder) couponError = `Add items worth Rs. ${(c.minOrder - subtotal).toLocaleString('en-IN')} more to use ${c.code}.`
    else {
      coupon = c
      if (c.kind === 'percent') couponDiscount = Math.min(Math.round((subtotal * c.value) / 100), c.maxDiscount ?? Infinity)
      else if (c.kind === 'flat') couponDiscount = Math.min(c.value, subtotal)
      else couponDiscount = deliveryFee
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - couponDiscount)
  const vatIncluded = Math.round(total - total / (1 + VAT_RATE))

  return {
    shipments, itemCount, mrpTotal, subtotal, productSavings: mrpTotal - subtotal,
    deliveryFee, couponDiscount, coupon, couponError, total, vatIncluded,
  }
}
