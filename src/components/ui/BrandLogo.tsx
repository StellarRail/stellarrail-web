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
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="StellarRail Logo Mark"
    >
      <defs>
        <linearGradient id="bgRailMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="50%" stopColor="#070C1B" />
          <stop offset="100%" stopColor="#02050D" />
        </linearGradient>
        <linearGradient id="rimRailMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#0284C7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1E293B" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="cyanRailMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      {/* Base Squircle */}
      <rect
        x="10"
        y="10"
        width="492"
        height="492"
        rx="112"
        fill="url(#bgRailMark)"
        stroke="url(#rimRailMark)"
        strokeWidth="6"
      />
      <rect
        x="22"
        y="22"
        width="468"
        height="468"
        rx="100"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeOpacity="0.25"
        strokeDasharray="8 8"
      />
      <circle cx="256" cy="256" r="148" fill="#0284C7" fillOpacity="0.15" />

      {/* Upper Kinetic Track */}
      <path
        d="M 104 214 L 206 122 L 306 122 L 408 214"
        fill="none"
        stroke="url(#cyanRailMark)"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 134 224 L 212 152 L 300 152 L 378 224"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="7"
        strokeOpacity="0.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lower Kinetic Track */}
      <path
        d="M 104 298 L 206 390 L 306 390 L 408 298"
        fill="none"
        stroke="url(#cyanRailMark)"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 134 288 L 212 360 L 300 360 L 378 288"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="7"
        strokeOpacity="0.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* High-speed corridors */}
      <line
        x1="72"
        y1="256"
        x2="186"
        y2="256"
        stroke="url(#cyanRailMark)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <line
        x1="326"
        y1="256"
        x2="440"
        y2="256"
        stroke="url(#cyanRailMark)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <line
        x1="84"
        y1="256"
        x2="168"
        y2="256"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="344"
        y1="256"
        x2="428"
        y2="256"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Faceted Stellar Consensus Star */}
      <g>
        <polygon points="256,146 256,256 238,256" fill="#FFFFFF" />
        <polygon points="256,146 274,256 256,256" fill="#BAE6FD" />
        <polygon points="256,366 256,256 274,256" fill="#0284C7" />
        <polygon points="256,366 238,256 256,256" fill="#0369A1" />
        <polygon points="366,256 256,256 256,238" fill="#38BDF8" />
        <polygon points="366,256 256,274 256,256" fill="#0284C7" />
        <polygon points="146,256 256,256 256,274" fill="#38BDF8" />
        <polygon points="146,256 256,238 256,256" fill="#FFFFFF" />
        <polygon points="256,234 278,256 256,278 234,256" fill="#FFFFFF" />
        <circle cx="256" cy="256" r="6" fill="#0284C7" />
      </g>
    </svg>
  )
}
