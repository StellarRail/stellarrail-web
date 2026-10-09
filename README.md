[![CI](https://github.com/StellarRail/stellarrail-web/actions/workflows/ci.yml/badge.svg)](https://github.com/StellarRail/stellarrail-web/actions/workflows/ci.yml)
[![E2E](https://github.com/StellarRail/stellarrail-web/actions/workflows/e2e.yml/badge.svg)](https://github.com/StellarRail/stellarrail-web/actions/workflows/e2e.yml)
[![Image](https://img.shields.io/badge/image-ghcr.io-blue)](https://github.com/StellarRail/stellarrail-web/pkgs/container/stellarrail-web)

# StellarRail Web

Operator / approver / admin dashboard for StellarRail payments.

- **Stack:** Next.js 15.5.27 (App Router, `output: standalone`) + TypeScript 5.4 strict + TanStack Query 5 + Zustand 4 + Tailwind 3.4 + shadcn/UI + `react-hook-form`/Zod + `next-intl` + Sentry
- **Version:** `1.0.0-rc1` · License: MIT
- **Org docs:** [profile](https://github.com/StellarRail/.github/blob/main/profile/README.md) ·
  [architecture](https://github.com/StellarRail/.github/blob/main/docs/ARCHITECTURE.md) ·
  [contributing](https://github.com/StellarRail/.github/blob/main/CONTRIBUTING.md)

## Structure

```text
src/
  app/              # / + (auth)/login+mfa + (dashboard)/payments+approvals+admin
  components/ui     # button input card dialog badge table skeleton toast
  components/layout # Header Sidebar Footer Banners
  components/auth   # RequireRole
  features/{auth,payments,approvals,admin,audit}/  # api.ts + components/ + hooks/
  lib/              # env query-client flags formatters validators sanitize logger
  hooks/            # session, countdown, autosave, realtime
  stores/           # auth-store ui-store
  services/         # api-client
  mocks/            # MSW handlers + seed (12 payments)
  types/
```

Routes: `/` home · `/login`, `/mfa` · `/payments`, `/payments/new`,
`/payments/[id]` · `/approvals`, `/approvals/history` ·
`/admin/{users,limits,network,health,audit}` · `/account` · `/notifications` · `/403`.
Middleware redirects unauthenticated `/payments|/approvals|/admin` to
`/login?next=…`. Hardened headers: CSP, `X-Frame-Options: DENY`,
HSTS (2 yr), `Referrer-Policy: strict-origin`.

## Setup (< 5 min)

```bash
nvm use || true
cp .env.example .env.local
npm ci --no-audit --no-fund
npm run dev  # mock mode: NEXT_PUBLIC_USE_MOCK=true
```

Demo accounts: `operator@stellarrail.test` / `approver@stellarrail.test` /
`admin@stellarrail.test` (password `password123`, MFA `123456`).

## Scripts

- `npm run dev|build|start|lint|typecheck|test|test:coverage|format`
- `npm run test:watch` (Vitest watch) · `npm run docker:build` · `npm run analyze` (bundle analyzer)

Tests: Vitest 2 + jsdom (`src/**/*.test.ts(x)`, coverage thresholds
70/60/60/70) + Playwright (`e2e/{core,a11y,visual}.spec.ts`, chromium +
Pixel 7, mock mode). CI runs `lint + typecheck + test:coverage`; E2E runs
sharded Playwright.

## Envs

See `.env.example` (fail-fast Zod validation in `src/lib/env.ts`):

| Var                           | Default                               |
| ----------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_API_URL`         | `http://localhost:8080/api`           |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet`                             |
| `NEXT_PUBLIC_HORIZON_URL`     | `https://horizon-testnet.stellar.org` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_USE_MOCK`        | `true`                                |
| `NEXT_PUBLIC_WS_URL`          | `""`                                  |
| `NEXT_PUBLIC_MAINTENANCE`     | `false`                               |
| `NEXT_PUBLIC_SENTRY_DSN`      | `""`                                  |

## Mock mode

`NEXT_PUBLIC_USE_MOCK=true` enables MSW handlers for auth/payments/users/audit.
Production builds set it to `false` and point `NEXT_PUBLIC_API_URL` at the
`stellarrail-api` (`/api/v1`).

## Troubleshooting

- Peer-deps: `npm install --legacy-peer-deps`
- OOM: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`
- Never run dev/start in CI; use `npm run build`.
- Pre-GA: report bugs via the [org bug template](https://github.com/StellarRail/.github/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml);
  security issues to `security@stellarrail.example` (see `SECURITY.md` in `.github`).
