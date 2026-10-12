import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getProduct } from '@/data/fixtures'
import type { CartLine, Destination } from '@/lib/pricing'

/**
 * Client-side cart & wishlist, persisted to localStorage.
 * A later milestone syncs this with the `carts` / `wishlists` tables once
 * customers can sign in with OTP; guests keep using local storage.
 */

interface ShopState {
  cart: CartLine[]
  wishlist: string[]
  destination: Destination
  couponCode: string
}

interface ShopContext extends ShopState {
  hydrated: boolean
  cartCount: number
  addToCart: (productId: string, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
  setDestination: (d: Destination) => void
  setCouponCode: (code: string) => void
  toast: string | null
}

const KEY = 'janakcart:v1'
const initial: ShopState = { cart: [], wishlist: [], destination: 'kathmandu-valley', couponCode: '' }
const Ctx = createContext<ShopContext | null>(null)

const clampQty = (productId: string, qty: number) => {
  const stock = getProduct(productId)?.stock ?? 0
  return Math.max(0, Math.min(qty, stock, 10))
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopState>(initial)
  const [hydrated, setHydrated] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setState({ ...initial, ...JSON.parse(raw) })
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state))
  }, [state, hydrated])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const addToCart = useCallback((productId: string, qty = 1) => {
    setState((s) => {
      const existing = s.cart.find((l) => l.productId === productId)
      const next = clampQty(productId, (existing?.qty ?? 0) + qty)
      if (next === 0) return s
      const cart = existing
        ? s.cart.map((l) => (l.productId === productId ? { ...l, qty: next } : l))
        : [...s.cart, { productId, qty: next }]
      return { ...s, cart }
    })
    setToast('Added to your cart')
  }, [])

  const setQty = useCallback((productId: string, qty: number) => {
    setState((s) => ({
      ...s,
      cart: s.cart
        .map((l) => (l.productId === productId ? { ...l, qty: clampQty(productId, qty) } : l))
        .filter((l) => l.qty > 0),
    }))
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((l) => l.productId !== productId) }))
  }, [])

  const toggleWishlist = useCallback((productId: string) => {
    setState((s) => {
      const has = s.wishlist.includes(productId)
      setToast(has ? 'Removed from wishlist' : 'Saved to wishlist')
      return { ...s, wishlist: has ? s.wishlist.filter((id) => id !== productId) : [...s.wishlist, productId] }
    })
  }, [])

  const value = useMemo<ShopContext>(
    () => ({
      ...state,
      hydrated,
      toast,
      cartCount: state.cart.reduce((a, l) => a + l.qty, 0),
      addToCart,
      setQty,
      removeFromCart,
      toggleWishlist,
      isWishlisted: (id) => state.wishlist.includes(id),
      setDestination: (destination) => setState((s) => ({ ...s, destination })),
      setCouponCode: (couponCode) => setState((s) => ({ ...s, couponCode })),
    }),
    [state, hydrated, toast, addToCart, setQty, removeFromCart, toggleWishlist],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useShop() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useShop must be used inside ShopProvider')
  return ctx
}
