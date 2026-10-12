/** JanakCart mark: a shopping bag whose handle is a Mithila-style fish arc. */
export function Logo({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden>
        <rect x="2" y="9" width="36" height="29" rx="9" fill="#c2321c" />
        <path d="M12 13c0-5 3.6-9 8-9s8 4 8 9" fill="none" stroke="#f7b928" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M11 25c4-5 12-5 16 0-4 5-12 5-16 0Z" fill="#f7b928" />
        <path d="M27 25l4-3.5v7Z" fill="#f7b928" />
        <circle cx="15.5" cy="24.4" r="1.4" fill="#1c1830" />
        <path d="M18 23v4M21 22.5v5M24 23v4" stroke="#c2321c" strokeWidth="1.1" />
      </svg>
      <span className={`font-display text-[1.45rem] font-extrabold leading-none tracking-tight ${light ? 'text-paper' : 'text-ink-900'}`}>
        Janak<span className="text-sindoor-600">Cart</span>
      </span>
    </span>
  )
}
