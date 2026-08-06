'use client'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QrModal({ address }: { address: string }): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded border px-2 py-1 text-xs">
        Show QR
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Destination QR"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <button
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white p-6">
            <QRCodeSVG value={address} size={200} />
            <p className="mt-2 text-xs">{address}</p>
          </div>
        </div>
      ) : null}
    </>
  )
}
