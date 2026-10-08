type BrandMarkSvgProps = {
  size?: number;
  className?: string;
  idPrefix?: string;
};

/** Custom open-book mark with gold page accent — used in logo, splash, favicon source */
export function BrandMarkSvg({ size = 40, className, idPrefix = "bm" }: BrandMarkSvgProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="48" height="48" rx="11" fill={`url(#${idPrefix}-bg)`} />
      <path
        d="M24 8C18 8 13 11 11 14v22c2.5-2.5 6.5-4 13-4s10.5 1.5 13 4V14c-2-3-7-6-13-6z"
        fill={`url(#${idPrefix}-cover)`}
        opacity="0.95"
      />
      <path
        d="M24 32c-6.5 0-10.5 1.5-13 4V14c2-3 7-6 13-6v24z"
        fill="#0f172a"
        opacity="0.35"
      />
      <path d="M24 8v24" stroke={`url(#${idPrefix}-gold)`} strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M17 18h5M26 18h5M17 22h5M26 22h5M17 26h4M27 26h4"
        stroke="#e8dcc8"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <defs>
        <linearGradient id={`${idPrefix}-bg`} x1="8" y1="6" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-cover`} x1="11" y1="8" x2="37" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-gold`} x1="24" y1="8" x2="24" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8dcc8" />
          <stop offset="1" stopColor="#d4a574" />
        </linearGradient>
      </defs>
    </svg>
  );
}
