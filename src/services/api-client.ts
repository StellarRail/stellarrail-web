export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export { newIdempotencyKey }

type FetchFn = typeof fetch

interface ApiClientOptions {
  baseURL: string
  getToken: () => string | null
  onRefresh: () => Promise<string | null>
  onAuthFailure: () => void
  fetchFn?: FetchFn
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export function createApiClient(opts: ApiClientOptions) {
  const doFetch = opts.fetchFn ?? fetch
  let refreshing: Promise<string | null> | null = null

  async function request<T>(path: string, init: RequestInit = {}, retryAuth = true): Promise<T> {
    const headers = new Headers(init.headers)
    const token = opts.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

    let res: Response
    try {
      res = await doFetch(`${opts.baseURL}${path}`, { ...init, headers })
    } catch (e) {
      throw new ApiError(0, 'NETWORK_ERROR', e instanceof Error ? e.message : 'Network error')
    }

    if (res.status === 401 && retryAuth) {
      if (!refreshing) refreshing = opts.onRefresh().finally(() => null)
      // single-flight refresh
      const p = refreshing
      refreshing = null
      const newToken = await p
      if (newToken) return request<T>(path, init, false)
      opts.onAuthFailure()
      throw new ApiError(401, 'UNAUTHORIZED', 'Session expired')
    }
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') ?? '30'
      throw new ApiError(429, 'RATE_LIMITED', `Too many attempts, try in ${retryAfter}s`)
    }
    if (!res.ok) {
      let message = `Request failed (${res.status})`
      try {
        const j = (await res.json()) as { message?: string; code?: string }
        if (j.message) message = j.message
      } catch {
        /* ignore */
      }
      throw new ApiError(res.status, `HTTP_${res.status}`, message)
    }
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }

  async function getWithRetry<T>(path: string, retries = 2): Promise<T> {
    let last: unknown
    for (let i = 0; i <= retries; i++) {
      try {
        return await request<T>(path, { method: 'GET' })
      } catch (e) {
        last = e
        if (e instanceof ApiError && (e.status === 0 || e.status >= 500)) {
          await sleep(300 * (i + 1))
          continue
        }
        throw e
      }
    }
    throw last
  }

  return {
    get: <T>(path: string) => getWithRetry<T>(path, 2),
    post: <T>(path: string, body?: unknown, idempotent = false) => {
      const headers: Record<string, string> = {}
      if (idempotent) headers['Idempotency-Key'] = newIdempotencyKey()
      return request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}), headers })
    },
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    newIdempotencyKey
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
