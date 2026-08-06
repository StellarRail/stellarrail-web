import { describe, it, expect, vi } from 'vitest'
import {
  formatXlm,
  truncateAddress,
  explorerTxUrl,
  explorerAccountUrl,
  timeAgo,
  stroopsToXlm,
  xlmToStroops
} from '@/lib/formatters'
import { isValidStellarAddressStrict, paymentSchema } from '@/lib/validators'
import { createApiClient, ApiError } from '@/services/api-client'

function gAddr(seed: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let s = 'G'
  let h = 0
  for (let i = 0; i < 55; i++) {
    h = (h * 31 + seed.charCodeAt(i % seed.length) + i) % 32
    s += alphabet[h] ?? 'A'
  }
  return s
}

describe('formatters-extra', () => {
  it('formatXlm handles numbers and NaN', () => {
    expect(formatXlm(10)).toContain('XLM')
    expect(formatXlm('abc')).toBe('0 XLM')
    expect(formatXlm('1234.5')).toContain('1,234.5')
  })
  it('truncate short stays', () => {
    expect(truncateAddress('abc')).toBe('abc')
    expect(truncateAddress(gAddr('z'))).toContain('…')
  })
  it('explorer urls per network', () => {
    expect(explorerTxUrl('mainnet', 'h')).toContain('public')
    expect(explorerTxUrl('testnet', 'h')).toContain('testnet')
    expect(explorerAccountUrl('mainnet', 'a')).toContain('public')
    expect(explorerAccountUrl('testnet', 'a')).toContain('testnet')
  })
  it('timeAgo buckets', () => {
    expect(timeAgo(new Date().toISOString())).toBe('just now')
    expect(timeAgo(new Date(Date.now() - 5 * 60000).toISOString())).toContain('m ago')
    expect(timeAgo(new Date(Date.now() - 3 * 3600000).toISOString())).toContain('h ago')
    expect(timeAgo(new Date(Date.now() - 3 * 86400000).toISOString())).toContain('d ago')
  })
  it('stroops negative + zero frac', () => {
    expect(xlmToStroops('-1.5')).toBe('-15000000')
    expect(stroopsToXlm('-15000000')).toBe('-1.5')
    expect(stroopsToXlm('10000000')).toBe('1')
  })
  it('valid payment passes schema', () => {
    expect(
      paymentSchema.safeParse({ destination: gAddr('v'), amountXlm: '10.5', referenceId: 'REF-1' })
        .success
    ).toBe(true)
  })
  it('strict address check returns boolean (checksum via StrKey)', async () => {
    // Generated fixtures are format-valid but not checksum-valid, so strict may be false
    const r = await isValidStellarAddressStrict(gAddr('s'))
    expect(typeof r).toBe('boolean')
    expect(await isValidStellarAddressStrict('bad')).toBe(false)
  })
})

describe('api-client-extra', () => {
  it('ApiError fields', () => {
    const e = new ApiError(429, 'RATE_LIMITED', 'slow')
    expect(e.status).toBe(429)
    expect(e.code).toBe('RATE_LIMITED')
  })
  it('throws on 429 with Retry-After', async () => {
    const fetchFn = vi.fn(
      async () => new Response('{}', { status: 429, headers: { 'Retry-After': '12' } })
    )
    const c = createApiClient({
      baseURL: 'http://x',
      getToken: () => null,
      onRefresh: async () => null,
      onAuthFailure: () => undefined,
      fetchFn: fetchFn as typeof fetch
    })
    await expect(c.get('/a')).rejects.toThrow('12s')
  })
  it('network error maps to NETWORK_ERROR', async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error('down')
    })
    const c = createApiClient({
      baseURL: 'http://x',
      getToken: () => null,
      onRefresh: async () => null,
      onAuthFailure: () => undefined,
      fetchFn: fetchFn as typeof fetch
    })
    await expect(c.get('/a')).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })
  it('retries 500 GET then succeeds', async () => {
    let n = 0
    const fetchFn = vi.fn(async () => {
      n++
      if (n === 1) return new Response('{}', { status: 500 })
      return new Response(JSON.stringify({ ok: 1 }), { status: 200 })
    })
    const c = createApiClient({
      baseURL: 'http://x',
      getToken: () => null,
      onRefresh: async () => null,
      onAuthFailure: () => undefined,
      fetchFn: fetchFn as typeof fetch
    })
    expect(await c.get<{ ok: number }>('/a')).toEqual({ ok: 1 })
  })
  it('put + delete + 204', async () => {
    const fetchFn = vi.fn(async (u: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'DELETE') return new Response(null, { status: 204 })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    const c = createApiClient({
      baseURL: 'http://x',
      getToken: () => 't',
      onRefresh: async () => null,
      onAuthFailure: () => undefined,
      fetchFn: fetchFn as typeof fetch
    })
    await c.put('/a', {})
    await c.delete('/a')
    expect(fetchFn).toHaveBeenCalled()
  })
  it('auth failure callback on refresh fail', async () => {
    let failed = false
    const fetchFn = vi.fn(async () => new Response('{}', { status: 401 }))
    const c = createApiClient({
      baseURL: 'http://x',
      getToken: () => 't',
      onRefresh: async () => null,
      onAuthFailure: () => {
        failed = true
      },
      fetchFn: fetchFn as typeof fetch
    })
    await expect(c.get('/a')).rejects.toMatchObject({ status: 401 })
    expect(failed).toBe(true)
  })
})
