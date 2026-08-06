export function log(event: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production') {
    // structured, no PII
    console.info(JSON.stringify({ event, ...sanitize(data) }))
  } else {
    console.info(`[${event}]`, sanitize(data))
  }
}
function sanitize(data?: Record<string, unknown>): Record<string, unknown> {
  if (!data) return {}
  const clone = { ...data }
  for (const k of ['email', 'address', 'destination', 'token'])
    if (k in clone) clone[k] = '[redacted]'
  return clone
}
export function reportWebVitals(metric: { name: string; value: number }): void {
  log('web-vital', { name: metric.name, value: metric.value })
}
