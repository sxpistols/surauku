export function MosqueLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M32 4l7 10 12-2-2 12 10 8-10 8 2 12-12-2-7 10-7-10-12 2 2-12-10-8 10-8-2-12 12 2z" opacity="0.45" />
      <path d="M22 44V34c0-6 4-9 10-13 6 4 10 7 10 13v10z" />
      <path d="M32 21v-5M30 15a2.5 2.5 0 1 0 4 0" />
      <path d="M18 44V30M46 44V30M16 44h32" />
      <path d="M29 44v-5a3 3 0 0 1 6 0v5" />
    </svg>
  );
}
