import { describe, it, expect, vi } from 'vitest'
import { createApiClient } from '@/services/api-client'

describe('api-client', () => {
  it('retries once after 401 refresh', async () => {
    let calls = 0
    const fetchFn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls++
      if (calls === 1) return new Response('{}', { status: 401 })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    const client = createApiClient({
      baseURL: 'http://x',
      getToken: () => 't',
      onRefresh: async () => 'new',
      onAuthFailure: () => undefined,
      fetchFn: fetchFn as typeof fetch
    })
    const r = await client.get<{ ok: boolean }>('/a')
    expect(r.ok).toBe(true)
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('sends Idempotency-Key on payment POST', async () => {
    let seen = ''
    const fetchFn = vi.fn(async (_u: string | URL | Request, init?: RequestInit) => {
      seen = new Headers(init?.headers).get('Idempotency-Key') ?? ''
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    const client = createApiClient({
      baseURL: 'http://x',
      getToken: () => null,
      onRefresh: async () => null,
      onAuthFailure: () => undefined,
      fetchFn: fetchFn as typeof fetch
    })
    await client.post('/payments', { a: 1 }, true)
    expect(seen.length).toBeGreaterThan(0)
  })
})
