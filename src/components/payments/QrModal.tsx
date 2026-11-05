'use client'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, X } from 'lucide-react'

export default function QrModal({ address }: { address: string }): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <QrCode size={13} />
        <span>Show QR</span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Destination QR"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-xs rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-center animate-item-reveal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                Stellar Public Key QR
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close QR dialog"
                className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            </div>
            <div className="flex justify-center p-3 bg-white rounded-lg border border-slate-200">
              <QRCodeSVG value={address} size={180} />
            </div>
            <p className="mt-3 font-mono text-[10px] text-slate-600 dark:text-slate-400 break-all select-all">
              {address}
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}
