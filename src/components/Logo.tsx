// Mark: speech bubble (language) holding three rising bars (levels).
// Keep in sync with src/app/icon.svg and public/logo-mark.svg.
// `loop` keeps the bars bouncing; without it they only grow in once.
export function LogoMark({ size = 40, loop = false }: { size?: number; loop?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={`logo-mark ${loop ? "logo-loop" : ""}`}
    >
      <rect width="48" height="48" rx="14" fill="#805ad5" />
      <path d="M16 30l-4 9 11-9z" fill="#ffffff" />
      <rect x="9" y="10" width="30" height="22" rx="7" fill="#ffffff" />
      {/* .logo-bar delays in globals.css rely on these being the 3rd-5th rect */}
      <rect className="logo-bar" x="15" y="22" width="4.5" height="6" rx="1.5" fill="#b794f4" />
      <rect className="logo-bar" x="21.75" y="18" width="4.5" height="10" rx="1.5" fill="#805ad5" />
      <rect className="logo-bar" x="28.5" y="14" width="4.5" height="14" rx="1.5" fill="#16a34a" />
    </svg>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" dir="ltr">
      <LogoMark size={size} />
      <span
        className="font-display font-bold text-foreground"
        style={{ fontSize: size * 0.65, lineHeight: 1 }}
      >
        Salma
      </span>
    </span>
  );
}
