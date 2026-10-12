/**
 * Stubbed marketplace data for the storefront.
 *
 * Everything the UI reads lives here so a later milestone can swap this module
 * for real queries against Netlify Database without touching the screens.
 * Prices are whole Nepali Rupees (NPR) and are VAT-inclusive.
 */

export type CategorySlug =
  | 'mobiles'
  | 'electronics'
  | 'fashion'
  | 'home-kitchen'
  | 'handicrafts'
  | 'grocery'
  | 'beauty'
  | 'sports'

export interface Category {
  slug: CategorySlug
  name: string
  tagline: string
  image: string
}

export interface Seller {
  id: string
  shopName: string
  city: string
  rating: number
  verified: boolean
  joined: string
}

export interface Review {
  id: string
  author: string
  rating: number
  title: string
  body: string
  date: string
  verifiedPurchase: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  category: CategorySlug
  sellerId: string
  image: string
  price: number
  mrp: number
  stock: number
  weightKg: number
  rating: number
  ratingCount: number
  highlights: string[]
  description: string
  specs: Record<string, string>
  tags: string[]
  isDeal?: boolean
  sku: string
}

export interface Banner {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  href: string
  image: string
  theme: 'vermilion' | 'cream'
}

export interface Coupon {
  code: string
  label: string
  kind: 'percent' | 'flat' | 'freeship'
  value: number
  maxDiscount?: number
  minOrder: number
}

// Product photos are generated assets in /public/img.
const img = (name: string) => `/img/${name}.png`

export const categories: Category[] = [
  { slug: 'mobiles', name: 'Mobiles', tagline: 'Latest 5G phones', image: img('p-phone') },
  { slug: 'electronics', name: 'Electronics', tagline: 'Laptops, audio & wearables', image: img('p-laptop') },
  { slug: 'fashion', name: 'Fashion', tagline: 'Kurtas, pashmina & more', image: img('p-kurta') },
  { slug: 'home-kitchen', name: 'Home & Kitchen', tagline: 'Cook, store, serve', image: img('p-cooker') },
  { slug: 'handicrafts', name: 'Handicrafts', tagline: 'Mithila & Himalayan art', image: img('p-mithila') },
  { slug: 'grocery', name: 'Grocery', tagline: 'Tea, honey, pantry', image: img('p-tea') },
  { slug: 'beauty', name: 'Beauty', tagline: 'Herbal skincare', image: img('p-serum') },
  { slug: 'sports', name: 'Sports & Outdoors', tagline: 'Trek-ready gear', image: img('p-backpack') },
]

export const sellers: Seller[] = [
  { id: 's-himtech', shopName: 'Himalaya Tech Hub', city: 'Kathmandu', rating: 4.6, verified: true, joined: '2024-03-11' },
  { id: 's-mithila', shopName: 'Mithila Kala Ghar', city: 'Janakpur', rating: 4.8, verified: true, joined: '2024-06-02' },
  { id: 's-dhaka', shopName: 'Palpa Dhaka Weavers', city: 'Palpa', rating: 4.7, verified: true, joined: '2024-09-19' },
  { id: 's-ghar', shopName: 'GharSansar Home Store', city: 'Lalitpur', rating: 4.4, verified: true, joined: '2025-01-07' },
  { id: 's-pahad', shopName: 'Pahadi Organics', city: 'Ilam', rating: 4.9, verified: true, joined: '2025-02-21' },
  { id: 's-trail', shopName: 'TrailHead Outdoors', city: 'Pokhara', rating: 4.5, verified: true, joined: '2025-04-15' },
]

export const products: Product[] = [
  {
    id: 'jc-1001', slug: 'himal-x5-5g', sku: 'HTH-HX5-128-TL', name: 'Himal X5 5G (8GB RAM, 128GB, Glacier Teal)',
    brand: 'Himal', category: 'mobiles', sellerId: 's-himtech', image: img('p-phone'),
    price: 32999, mrp: 38999, stock: 42, weightKg: 0.4, rating: 4.4, ratingCount: 2184, isDeal: true,
    highlights: ['6.6" 120Hz AMOLED display', '50MP + 8MP + 2MP triple camera', '5000 mAh battery, 45W fast charge', 'Dual SIM, Nepal Telecom & Ncell 5G ready'],
    description: 'A fast, all-day 5G phone tuned for Nepal’s networks. The 120Hz AMOLED screen stays readable in bright Terai sunshine, and the 5000 mAh battery comfortably lasts through load-shedding days.',
    specs: { Display: '6.6" FHD+ AMOLED, 120Hz', Processor: 'Octa-core 2.4GHz', RAM: '8 GB', Storage: '128 GB (expandable)', Battery: '5000 mAh', Warranty: '1 year brand warranty' },
    tags: ['5g', 'phone', 'android'],
  },
  {
    id: 'jc-1002', slug: 'sagarmatha-buds-pro', sku: 'HTH-SBP-WHT', name: 'Sagarmatha Buds Pro ANC Wireless Earbuds',
    brand: 'Sagarmatha Audio', category: 'electronics', sellerId: 's-himtech', image: img('p-earbuds'),
    price: 4499, mrp: 7999, stock: 6, weightKg: 0.15, rating: 4.2, ratingCount: 961, isDeal: true,
    highlights: ['Active noise cancellation up to 32 dB', '36 hours total playback', 'IPX5 sweat resistant', 'Bluetooth 5.3 low-latency mode'],
    description: 'Cut out microbus noise and focus on your music. Buds Pro pair instantly and charge fully in 70 minutes.',
    specs: { Connectivity: 'Bluetooth 5.3', Battery: '8h buds + 28h case', 'Water resistance': 'IPX5', Warranty: '6 months' },
    tags: ['audio', 'earbuds', 'wireless'],
  },
  {
    id: 'jc-1003', slug: 'kathmandu-pro-14', sku: 'HTH-KP14-16-512', name: 'Kathmandu Pro 14 Laptop (16GB, 512GB SSD)',
    brand: 'Kathmandu Computing', category: 'electronics', sellerId: 's-himtech', image: img('p-laptop'),
    price: 104999, mrp: 119999, stock: 11, weightKg: 1.6, rating: 4.6, ratingCount: 412,
    highlights: ['14" 2.8K display, 100% sRGB', 'Backlit keyboard', '1.3 kg aluminium body', '12-hour battery'],
    description: 'A light, metal-bodied laptop for students and professionals. Fast SSD storage and a sharp 2.8K screen make it equally good for coding, design and Netflix.',
    specs: { Display: '14" 2880×1800', Memory: '16 GB LPDDR5', Storage: '512 GB NVMe SSD', Weight: '1.3 kg', OS: 'Windows 11 Home', Warranty: '2 years' },
    tags: ['laptop', 'computer'],
  },
  {
    id: 'jc-1004', slug: 'pulse-smartwatch', sku: 'HTH-PLS-TC', name: 'Pulse Round AMOLED Smartwatch with SpO2',
    brand: 'Pulse', category: 'electronics', sellerId: 's-himtech', image: img('p-watch'),
    price: 5999, mrp: 9499, stock: 0, weightKg: 0.2, rating: 4.1, ratingCount: 733,
    highlights: ['1.43" AMOLED always-on display', 'Heart rate, SpO2 & sleep tracking', 'Bluetooth calling', '7-day battery'],
    description: 'Track steps up to Nagarkot and back. Pulse records 100+ workout modes and shows notifications from your phone.',
    specs: { Display: '1.43" AMOLED', Battery: 'Up to 7 days', Sensors: 'HR, SpO2, accelerometer', Warranty: '1 year' },
    tags: ['watch', 'fitness', 'wearable'],
  },
  {
    id: 'jc-1005', slug: 'palpali-dhaka-topi', sku: 'PDW-TOPI-M', name: 'Handwoven Palpali Dhaka Topi',
    brand: 'Palpa Dhaka Weavers', category: 'fashion', sellerId: 's-dhaka', image: img('p-topi'),
    price: 899, mrp: 1200, stock: 120, weightKg: 0.1, rating: 4.8, ratingCount: 1532, isDeal: true,
    highlights: ['Handloom Dhaka fabric from Palpa', 'Traditional geometric weave', 'Sizes 21"–23"', 'Supports local artisans'],
    description: 'An authentic Dhaka topi woven on wooden looms in Palpa. Every piece has a slightly unique pattern.',
    specs: { Material: 'Cotton Dhaka', Origin: 'Palpa, Nepal', Care: 'Dry clean recommended' },
    tags: ['topi', 'traditional', 'dhaka', 'men'],
  },
  {
    id: 'jc-1006', slug: 'chyangra-pashmina-shawl', sku: 'PDW-PSH-MRN', name: 'Pure Chyangra Pashmina Shawl — Maroon',
    brand: 'Palpa Dhaka Weavers', category: 'fashion', sellerId: 's-dhaka', image: img('p-pashmina'),
    price: 7499, mrp: 9999, stock: 18, weightKg: 0.3, rating: 4.7, ratingCount: 288,
    highlights: ['100% Chyangra pashmina', '200 × 70 cm', 'Hand-finished fringe', 'Comes in a gift box'],
    description: 'Feather-light and remarkably warm. Hand-woven from the fine undercoat of Himalayan mountain goats.',
    specs: { Material: '100% Pashmina', Size: '200 × 70 cm', Origin: 'Nepal', Care: 'Dry clean only' },
    tags: ['shawl', 'pashmina', 'women', 'gift'],
  },
  {
    id: 'jc-1007', slug: 'trailrun-sneakers', sku: 'THO-TRS-42', name: 'TrailRun Lite Men’s Running Shoes',
    brand: 'TrailHead', category: 'sports', sellerId: 's-trail', image: img('p-sneakers'),
    price: 3799, mrp: 5499, stock: 34, weightKg: 0.9, rating: 4.3, ratingCount: 845,
    highlights: ['Breathable knit upper', 'Cushioned EVA midsole', 'Grippy rubber outsole', 'Sizes 39–45'],
    description: 'Light shoes that handle both Ring Road mornings and dusty hill trails.',
    specs: { Upper: 'Engineered knit', Sole: 'EVA + rubber', Weight: '260 g (size 42)' },
    tags: ['shoes', 'running', 'men'],
  },
  {
    id: 'jc-1008', slug: 'saffron-block-print-kurta', sku: 'PDW-KRT-SF-M', name: 'Saffron Block-Print Cotton Kurta Set',
    brand: 'Palpa Dhaka Weavers', category: 'fashion', sellerId: 's-dhaka', image: img('p-kurta'),
    price: 2899, mrp: 3999, stock: 4, weightKg: 0.5, rating: 4.5, ratingCount: 377, isDeal: true,
    highlights: ['Kurta, pant and dupatta', 'Pure cotton, hand block-printed', 'Sizes S–XXL', 'Festive & daily wear'],
    description: 'A breathable three-piece set in a warm saffron tone — perfect for Teej and Tihar gatherings.',
    specs: { Fabric: 'Cotton', Set: 'Kurta + pant + dupatta', Care: 'Gentle hand wash' },
    tags: ['kurta', 'women', 'festive'],
  },
  {
    id: 'jc-1009', slug: 'steel-pressure-cooker-5l', sku: 'GSH-PC-5L', name: 'Tri-Ply Stainless Steel Pressure Cooker 5L',
    brand: 'GharSansar', category: 'home-kitchen', sellerId: 's-ghar', image: img('p-cooker'),
    price: 3499, mrp: 4599, stock: 57, weightKg: 2.8, rating: 4.4, ratingCount: 1290,
    highlights: ['Induction & gas compatible', 'Tri-ply base for even heating', 'Safety valve + gasket release', '5 year warranty'],
    description: 'Cook dal, rice and masu faster. The tri-ply base heats evenly and works on induction.',
    specs: { Capacity: '5 L', Material: 'Stainless steel', Compatible: 'Gas, induction', Warranty: '5 years' },
    tags: ['cooker', 'kitchen'],
  },
  {
    id: 'jc-1010', slug: 'hammered-copper-bottle', sku: 'GSH-CPR-1L', name: 'Hammered Copper Water Bottle with Tumbler',
    brand: 'GharSansar', category: 'home-kitchen', sellerId: 's-ghar', image: img('p-bottle'),
    price: 1599, mrp: 2499, stock: 73, weightKg: 0.6, rating: 4.3, ratingCount: 654,
    highlights: ['Pure copper, 1 litre', 'Hand-hammered finish', 'Leak-proof cap', 'Matching 300 ml tumbler'],
    description: 'Hand-hammered by Patan metalworkers. Keep water in copper overnight for the traditional tamba-jal ritual.',
    specs: { Material: '99.9% copper', Capacity: '1 L', Origin: 'Patan, Nepal' },
    tags: ['copper', 'bottle', 'gift'],
  },
  {
    id: 'jc-1011', slug: 'mithila-peacock-painting', sku: 'MKG-PNT-PCK-A3', name: 'Original Mithila Painting — Twin Peacocks (A3, Framed)',
    brand: 'Mithila Kala Ghar', category: 'handicrafts', sellerId: 's-mithila', image: img('p-mithila'),
    price: 5499, mrp: 6999, stock: 3, weightKg: 1.2, rating: 4.9, ratingCount: 214, isDeal: true,
    highlights: ['Hand-painted by Janakpur women artists', 'Natural pigments on handmade paper', 'A3 size, wooden frame', 'Certificate of authenticity'],
    description: 'A one-of-a-kind Mithila artwork from Janakpurdham. Peacocks symbolise love and prosperity in Maithili tradition.',
    specs: { Size: 'A3 (29.7 × 42 cm)', Medium: 'Natural pigments', Frame: 'Teak wood', Origin: 'Janakpur, Nepal' },
    tags: ['mithila', 'madhubani', 'art', 'gift', 'janakpur'],
  },
  {
    id: 'jc-1012', slug: 'hand-hammered-singing-bowl', sku: 'MKG-SB-6IN', name: 'Hand-Hammered Singing Bowl Set (6")',
    brand: 'Mithila Kala Ghar', category: 'handicrafts', sellerId: 's-mithila', image: img('p-bowl'),
    price: 4299, mrp: 5999, stock: 22, weightKg: 1.0, rating: 4.7, ratingCount: 509,
    highlights: ['Seven-metal alloy', 'Includes cushion and striker', 'Deep, long-lasting tone', 'For meditation & yoga'],
    description: 'Hammered by hand in the Kathmandu valley. Produces a warm, layered tone ideal for meditation.',
    specs: { Diameter: '6 in (15 cm)', Material: 'Bronze alloy', Includes: 'Cushion, striker' },
    tags: ['singing bowl', 'meditation', 'gift'],
  },
  {
    id: 'jc-1013', slug: 'ilam-first-flush-tea', sku: 'PAO-TEA-FF-250', name: 'Ilam First Flush Orthodox Black Tea (250g)',
    brand: 'Pahadi Organics', category: 'grocery', sellerId: 's-pahad', image: img('p-tea'),
    price: 899, mrp: 1100, stock: 210, weightKg: 0.3, rating: 4.8, ratingCount: 1877,
    highlights: ['Single-estate, Ilam', 'Spring first flush', 'Floral, muscatel notes', 'Airtight gift tin'],
    description: 'Hand-plucked from high-altitude gardens in Ilam. Brew 3 minutes for a bright, floral cup.',
    specs: { Weight: '250 g', Origin: 'Ilam, Nepal', Type: 'Orthodox black tea' },
    tags: ['tea', 'ilam', 'organic'],
  },
  {
    id: 'jc-1014', slug: 'wild-himalayan-honey', sku: 'PAO-HNY-500', name: 'Raw Wild Himalayan Honey (500g)',
    brand: 'Pahadi Organics', category: 'grocery', sellerId: 's-pahad', image: img('p-honey'),
    price: 1199, mrp: 1499, stock: 88, weightKg: 0.7, rating: 4.6, ratingCount: 992,
    highlights: ['Unprocessed & unheated', 'Sourced from mid-hill forests', 'No added sugar', 'Glass jar'],
    description: 'Raw, golden honey collected by smallholder beekeepers in eastern Nepal.',
    specs: { Weight: '500 g', Origin: 'Eastern Nepal', Storage: 'Room temperature' },
    tags: ['honey', 'organic'],
  },
  {
    id: 'jc-1015', slug: 'timur-herbal-face-serum', sku: 'PAO-SRM-30', name: 'Herbal Vitamin C Face Serum with Timur (30ml)',
    brand: 'Pahadi Organics', category: 'beauty', sellerId: 's-pahad', image: img('p-serum'),
    price: 1299, mrp: 1899, stock: 9, weightKg: 0.1, rating: 4.2, ratingCount: 418,
    highlights: ['Vitamin C + Himalayan herbs', 'Lightweight, non-greasy', 'For all skin types', 'Cruelty-free'],
    description: 'Brightens dull skin with stable vitamin C and soothing Himalayan botanicals.',
    specs: { Volume: '30 ml', 'Skin type': 'All', 'Key ingredients': 'Vitamin C, timur, aloe' },
    tags: ['serum', 'skincare'],
  },
  {
    id: 'jc-1016', slug: 'annapurna-40l-backpack', sku: 'THO-BP-40-GR', name: 'Annapurna 40L Trekking Backpack',
    brand: 'TrailHead', category: 'sports', sellerId: 's-trail', image: img('p-backpack'),
    price: 5299, mrp: 7499, stock: 27, weightKg: 1.4, rating: 4.6, ratingCount: 671, isDeal: true,
    highlights: ['40 L with rain cover', 'Ventilated back panel', 'Hip belt pockets', 'Hydration-sleeve ready'],
    description: 'Built for tea-house treks — enough room for a week on the Annapurna circuit.',
    specs: { Capacity: '40 L', Material: 'Ripstop nylon', Weight: '1.4 kg' },
    tags: ['backpack', 'trekking', 'outdoor'],
  },
]

export const banners: Banner[] = [
  {
    id: 'b-festive', eyebrow: 'Dashain–Tihar Mahotsav', title: 'Up to 60% off across the marketplace',
    subtitle: 'Phones, fashion and festive gifts from verified sellers. Cash on Delivery everywhere we deliver.',
    cta: 'Shop festive deals', href: '/search?deals=true', image: '/img/banner-festive.png', theme: 'vermilion',
  },
  {
    id: 'b-mithila', eyebrow: 'Made in Nepal', title: 'Art & craft straight from Janakpur',
    subtitle: 'Original Mithila paintings, singing bowls and Dhaka weaves — every purchase supports the artisan.',
    cta: 'Explore handicrafts', href: '/search?category=handicrafts', image: '/img/banner-mithila.png', theme: 'cream',
  },
]

export const coupons: Coupon[] = [
  { code: 'JANAK10', label: '10% off up to Rs. 500 on orders above Rs. 1,000', kind: 'percent', value: 10, maxDiscount: 500, minOrder: 1000 },
  { code: 'DASHAIN500', label: 'Flat Rs. 500 off on orders above Rs. 5,000', kind: 'flat', value: 500, minOrder: 5000 },
  { code: 'FREESHIP', label: 'Free delivery on any order', kind: 'freeship', value: 0, minOrder: 0 },
]

const reviewPool: Omit<Review, 'id'>[] = [
  { author: 'Sujata K.', rating: 5, title: 'Exactly as described', body: 'Arrived in Lalitpur in two days, well packed. Quality is better than I expected for the price.', date: '2026-09-21', verifiedPurchase: true },
  { author: 'Rabin T.', rating: 4, title: 'Good value', body: 'Works well. Delivery partner called before arriving, paid cash on delivery without any problem.', date: '2026-09-02', verifiedPurchase: true },
  { author: 'Anjali Jha', rating: 5, title: 'Gifted it to my mother', body: 'She loved it. Seller added a handwritten thank-you note — nice touch.', date: '2026-08-17', verifiedPurchase: true },
  { author: 'Bikash G.', rating: 3, title: 'Okay, packaging could be better', body: 'Product is fine but the outer box was slightly damaged. Seller responded quickly to my message.', date: '2026-07-30', verifiedPurchase: false },
]

export function getReviews(productId: string): Review[] {
  const offset = Number(productId.replace(/\D/g, '')) % reviewPool.length
  return [...reviewPool.slice(offset), ...reviewPool.slice(0, offset)].map((r, i) => ({ ...r, id: `${productId}-r${i}` }))
}

export const getProduct = (id: string) => products.find((p) => p.id === id || p.slug === id)
export const getSeller = (id: string) => sellers.find((s) => s.id === id)
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug)
export const discountPercent = (p: Pick<Product, 'price' | 'mrp'>) => Math.round(((p.mrp - p.price) / p.mrp) * 100)

export const LOW_STOCK_THRESHOLD = 10

/** Default marketplace commission by category (percent of item price, excl. delivery). */
export const commissionRates: Record<CategorySlug, number> = {
  mobiles: 5,
  electronics: 7,
  fashion: 12,
  'home-kitchen': 10,
  handicrafts: 6,
  grocery: 8,
  beauty: 12,
  sports: 10,
}
