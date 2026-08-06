export const STROOPS_PER_XLM = 10_000_000

export function xlmToStroops(xlm: string): string {
  const [w = '0', f = ''] = xlm.split('.')
  const frac = (f + '0000000').slice(0, 7)
  const neg = w.startsWith('-')
  const wi = BigInt(neg ? w.slice(1) || '0' : w || '0')
  const v = wi * BigInt(STROOPS_PER_XLM) + BigInt(frac || '0')
  return (neg ? '-' : '') + v.toString()
}

export function stroopsToXlm(stroops: string | number | bigint): string {
  const b = BigInt(stroops)
  const neg = b < 0n
  const abs = neg ? -b : b
  const whole = abs / BigInt(STROOPS_PER_XLM)
  const frac = (abs % BigInt(STROOPS_PER_XLM)).toString().padStart(7, '0').replace(/0+$/, '')
  return `${neg ? '-' : ''}${whole.toString()}${frac ? `.${frac}` : ''}`
}

export function formatXlm(v: string | number): string {
  const n = typeof v === 'string' ? Number(v) : v
  if (!Number.isFinite(n)) return '0 XLM'
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 7 })} XLM`
}

export function truncateAddress(addr: string, chars = 6): string {
  if (addr.length <= chars * 2 + 3) return addr
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`
}

export function explorerTxUrl(network: 'testnet' | 'mainnet', hash: string): string {
  const base =
    network === 'mainnet'
      ? 'https://stellar.expert/explorer/public'
      : 'https://stellar.expert/explorer/testnet'
  return `${base}/tx/${hash}`
}

export function explorerAccountUrl(network: 'testnet' | 'mainnet', addr: string): string {
  const base =
    network === 'mainnet'
      ? 'https://stellar.expert/explorer/public'
      : 'https://stellar.expert/explorer/testnet'
  return `${base}/account/${addr}`
}

export function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0] as Record<string, unknown>)
  const lines = [headers.map(csvEscape).join(',')]
  for (const r of rows) {
    lines.push(
      headers.map((h) => csvEscape(String((r as Record<string, unknown>)[h] ?? ''))).join(',')
    )
  }
  return lines.join('\n')
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
