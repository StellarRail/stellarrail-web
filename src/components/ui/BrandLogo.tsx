import React from 'react'

interface BrandMarkProps {
  size?: number
  className?: string
}

export function BrandMark({ size = 32, className = '' }: BrandMarkProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="StellarRail Logo Mark"
    >
      {/* Precision architectural squircle background */}
      <rect width="32" height="32" rx="7" fill="#0F172A" />
      {/* Subtle border */}
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#334155" strokeWidth="1" />
      {/* Precision parallel settlement rails */}
      <path
        d="M8 11H24M8 16H24M8 21H24"
        stroke="#94A3B8"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Accent quorum connector */}
      <rect x="13" y="8" width="6" height="16" rx="2" fill="#0284C7" />
      <circle cx="16" cy="16" r="1.5" fill="#FFFFFF" />
    </svg>
  )
}
