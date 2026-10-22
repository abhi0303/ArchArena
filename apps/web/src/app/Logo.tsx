export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#4f46e5" />
      <path d="M18 22h12M34 42h12M24 22v20h10" stroke="#c7d2fe" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="11" y="16" width="14" height="12" rx="3.5" fill="#fff" />
      <rect x="39" y="16" width="14" height="12" rx="3.5" fill="#a5b4fc" />
      <rect x="39" y="36" width="14" height="12" rx="3.5" fill="#fff" />
      <path d="M25 22h14" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
