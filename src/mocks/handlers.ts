import { http, HttpResponse } from 'msw'
import { seedPayments, seedUsers, seedAudit } from '@/mocks/seed'

const BLOCKED = new Set(['GBLOCKEDBLOCKEDBLOCKEDBLOCKEDBLOCKEDBLOCKEDBLOCKEDBLK1'])

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (!body.email || !body.password || body.password.length < 8) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }
    const user = seedUsers.find((u) => u.email === body.email) ?? seedUsers[0]!
    return HttpResponse.json({
      mfaRequired: true,
      user,
      pendingToken: 'pending-mock-token'
    })
  }),
  http.post('/api/auth/mfa', async ({ request }) => {
    const body = (await request.json()) as { code?: string }
    if (body.code === '123456') {
      return HttpResponse.json({
        user: seedUsers[0],
        accessToken: 'mock-access-token',
        expiresIn: 900
      })
    }
    return HttpResponse.json({ message: 'Invalid code', attemptsLeft: 2 }, { status: 401 })
  }),
  http.post('/api/auth/refresh', () =>
    HttpResponse.json({ accessToken: 'mock-access-token-2', expiresIn: 900 })
  ),
  http.post('/api/auth/logout', () => HttpResponse.json({ ok: true })),
  http.get('/api/payments', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const q = url.searchParams.get('q') ?? ''
    let data = seedPayments
    if (status) data = data.filter((p) => p.status === status)
    if (q) data = data.filter((p) => p.destination.includes(q) || p.referenceId.includes(q))
    return HttpResponse.json({ data, page: 1, limit: 20, total: data.length })
  }),
  http.get('/api/payments/stats', () =>
    HttpResponse.json({ pending: 4, settledMonth: 12, volumeXlm: '48250.5', failed: 1 })
  ),
  http.get('/api/payments/:id', ({ params }) => {
    const p = seedPayments.find((x) => x.id === params.id)
    if (!p) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(p)
  }),
  http.post('/api/payments', () =>
    HttpResponse.json(
      { ...seedPayments[0], id: 'pay_new', status: 'PENDING_APPROVAL' },
      { status: 201 }
    )
  ),
  http.post('/api/payments/:id/approve', () => HttpResponse.json({ ok: true, status: 'SETTLED' })),
  http.post('/api/payments/:id/reject', () => HttpResponse.json({ ok: true, status: 'REFUNDED' })),
  http.get('/api/blocklist/check', ({ request }) => {
    const url = new URL(request.url)
    const addr = url.searchParams.get('address') ?? ''
    if (BLOCKED.has(addr)) return HttpResponse.json({ blocked: true, reason: 'Sanctions hit' })
    return HttpResponse.json({ blocked: false })
  }),
  http.get('/api/users', () => HttpResponse.json({ data: seedUsers })),
  http.get('/api/audit', () => HttpResponse.json({ data: seedAudit, total: seedAudit.length })),
  http.get('/api/health', () =>
    HttpResponse.json({
      api: 'ok',
      horizonLatencyMs: 120,
      rpcLatencyMs: 210,
      queueDepth: 3,
      lastReconciliation: new Date().toISOString(),
      mismatches: 0
    })
  ),
  http.get('/api/notifications', () =>
    HttpResponse.json({
      data: [{ id: 'n1', text: 'Payment pay_004 settled', unread: true }],
      unread: 1
    })
  ),
  http.get('/api/config/limits', () =>
    HttpResponse.json({ perTx: 10000, daily: 50000, require2Approvers: 25000 })
  )
]
