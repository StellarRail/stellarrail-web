import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8080/api'),
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
  NEXT_PUBLIC_HORIZON_URL: z.string().url().default('https://horizon-testnet.stellar.org'),
  NEXT_PUBLIC_SOROBAN_RPC_URL: z.string().url().default('https://soroban-testnet.stellar.org'),
  NEXT_PUBLIC_USE_MOCK: z
    .string()
    .optional()
    .transform((v) => v === 'true')
    .pipe(z.boolean())
    .optional(),
  NEXT_PUBLIC_WS_URL: z.string().optional().default(''),
  NEXT_PUBLIC_MAINTENANCE: z
    .string()
    .optional()
    .transform((v) => v === 'true')
    .pipe(z.boolean())
    .optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional().default('')
})

export type Env = {
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_STELLAR_NETWORK: 'testnet' | 'mainnet'
  NEXT_PUBLIC_HORIZON_URL: string
  NEXT_PUBLIC_SOROBAN_RPC_URL: string
  NEXT_PUBLIC_USE_MOCK: boolean
  NEXT_PUBLIC_WS_URL: string
  NEXT_PUBLIC_MAINTENANCE: boolean
  NEXT_PUBLIC_SENTRY_DSN: string
}

function parseEnv(): Env {
  const raw = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL,
    NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_MAINTENANCE: process.env.NEXT_PUBLIC_MAINTENANCE,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
  }
  const parsed = envSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    if (process.env.NODE_ENV !== 'production') {
      // Fail fast with readable error in dev
      throw new Error(`[env] Invalid environment configuration: ${msg}`)
    }
    throw new Error(`Invalid env: ${msg}`)
  }
  return {
    NEXT_PUBLIC_API_URL: parsed.data.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STELLAR_NETWORK: parsed.data.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_HORIZON_URL: parsed.data.NEXT_PUBLIC_HORIZON_URL,
    NEXT_PUBLIC_SOROBAN_RPC_URL: parsed.data.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_USE_MOCK: parsed.data.NEXT_PUBLIC_USE_MOCK ?? true,
    NEXT_PUBLIC_WS_URL: parsed.data.NEXT_PUBLIC_WS_URL ?? '',
    NEXT_PUBLIC_MAINTENANCE: parsed.data.NEXT_PUBLIC_MAINTENANCE ?? false,
    NEXT_PUBLIC_SENTRY_DSN: parsed.data.NEXT_PUBLIC_SENTRY_DSN ?? ''
  }
}

export const env: Env = parseEnv()
export const isMainnet = (): boolean => env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
export const useMock = (): boolean => env.NEXT_PUBLIC_USE_MOCK
