import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Info, ShieldCheck, Smartphone } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { z } from 'zod'
import { Logo } from '@/components/Logo'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({ meta: [{ title: 'Sign in — JanakCart' }] }),
  component: LoginPage,
})

// Nepali mobile numbers: 10 digits starting 97/98 (NTC, Ncell, SmartCell)
const NEPAL_MOBILE = /^9[78]\d{8}$/

/**
 * Sign-in screen preview. The OTP request/verify calls are wired up in the
 * auth milestone (see PLAN.md) — no code is sent from this screen yet.
 */
function LoginPage() {
  const { next } = Route.useSearch()
  const [step, setStep] = useState<'phone' | 'otp' | 'done'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const sendOtp = (e: FormEvent) => {
    e.preventDefault()
    if (!NEPAL_MOBILE.test(phone)) return setError('Enter a valid 10-digit Nepali mobile number (98XXXXXXXX).')
    setError('')
    setStep('otp')
    setResendIn(30)
    setTimeout(() => inputs.current[0]?.focus(), 50)
  }

  const verify = (e: FormEvent) => {
    e.preventDefault()
    if (otp.join('').length !== 6) return setError('Enter the 6-digit code.')
    setError('')
    setStep('done')
  }

  const setDigit = (i: number, v: string) => {
    const digits = v.replace(/\D/g, '')
    if (digits.length > 1) {
      const filled = digits.slice(0, 6).split('')
      setOtp((o) => o.map((_, k) => filled[k] ?? ''))
      inputs.current[Math.min(filled.length, 5)]?.focus()
      return
    }
    setOtp((o) => o.map((d, k) => (k === i ? digits : d)))
    if (digits && i < 5) inputs.current[i + 1]?.focus()
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-0 overflow-hidden px-4 py-10 md:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-l-3xl bg-sindoor-600 p-10 text-white md:block">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-marigold-300">Welcome to JanakCart</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight">One number. Every order, tracked.</h1>
        <ul className="mt-8 space-y-4 text-sm text-white/90">
          <li className="flex gap-3"><Smartphone className="h-5 w-5 shrink-0 text-marigold-300" /> Sign in with your mobile — no password to remember</li>
          <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-marigold-300" /> Codes expire in 5 minutes and are never shared with sellers</li>
        </ul>
        <div className="mithila-border absolute inset-x-0 bottom-0" />
      </div>

      <div className="rounded-3xl bg-white p-8 ring-1 ring-ink-900/5 md:rounded-l-none md:p-10">
        <Logo />
        <div className="mt-6 flex gap-2 rounded-xl bg-marigold-100 p-3 text-xs text-ink-700">
          <Info className="h-4 w-4 shrink-0 text-marigold-500" />
          Preview: SMS delivery is not connected yet, so no code is sent. Any 6 digits continue the walkthrough.
        </div>

        {step === 'phone' && (
          <form onSubmit={sendOtp} className="mt-6">
            <h2 className="font-display text-2xl font-bold">{next === 'checkout' ? 'Sign in to check out' : 'Sign in or create an account'}</h2>
            <p className="mt-1 text-sm text-ink-500">We’ll text a 6-digit verification code to your phone.</p>
            <label className="mt-6 block text-sm font-semibold" htmlFor="phone">Mobile number</label>
            <div className="mt-2 flex items-center rounded-xl bg-paper ring-1 ring-ink-900/10 focus-within:ring-2 focus-within:ring-sindoor-500">
              <span className="border-r border-ink-900/10 px-3 py-3 text-sm font-semibold">🇳🇵 +977</span>
              <input id="phone" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="98XXXXXXXX" className="w-full bg-transparent px-3 py-3 text-sm tracking-wider outline-none" />
            </div>
            {error && <p className="mt-2 text-xs text-sindoor-700">{error}</p>}
            <button className="mt-6 w-full rounded-full bg-sindoor-600 py-3.5 font-semibold text-white hover:bg-sindoor-700">Send code</button>
            <p className="mt-4 text-center text-xs text-ink-500">
              By continuing you agree to our <Link to="/help" hash="privacy" className="underline">privacy policy</Link> and <Link to="/help" hash="returns" className="underline">return policy</Link>.
            </p>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verify} className="mt-6">
            <button type="button" onClick={() => setStep('phone')} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> Change number</button>
            <h2 className="mt-3 font-display text-2xl font-bold">Enter verification code</h2>
            <p className="mt-1 text-sm text-ink-500">Sent to +977 {phone.slice(0, 3)}•••{phone.slice(-3)}</p>
            <div className="mt-6 flex justify-between gap-2">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => e.key === 'Backspace' && !d && i > 0 && inputs.current[i - 1]?.focus()}
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={6}
                  aria-label={`Digit ${i + 1}`}
                  className="h-14 w-full rounded-xl bg-paper text-center font-display text-2xl font-bold outline-none ring-1 ring-ink-900/10 focus:ring-2 focus:ring-sindoor-500"
                />
              ))}
            </div>
            {error && <p className="mt-2 text-xs text-sindoor-700">{error}</p>}
            <button className="mt-6 w-full rounded-full bg-sindoor-600 py-3.5 font-semibold text-white hover:bg-sindoor-700">Verify & continue</button>
            <p className="mt-4 text-center text-sm text-ink-500">
              {resendIn > 0 ? `Resend code in ${resendIn}s` : <button type="button" onClick={() => setResendIn(30)} className="font-semibold text-sindoor-600">Resend code</button>}
            </p>
          </form>
        )}

        {step === 'done' && (
          <div className="mt-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-50 text-leaf-600"><ShieldCheck className="h-8 w-8" /></div>
            <h2 className="mt-4 font-display text-2xl font-bold">That’s the sign-in flow</h2>
            <p className="mt-2 text-sm text-ink-500">
              Accounts, saved addresses, checkout and order tracking switch on with the customer-accounts release.
              Your cart is kept on this device until then.
            </p>
            <Link to={next === 'checkout' ? '/cart' : '/'} className="mt-6 inline-block rounded-full bg-ink-900 px-6 py-3 font-semibold text-paper">
              {next === 'checkout' ? 'Back to cart' : 'Continue shopping'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
