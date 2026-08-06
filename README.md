![CI](https://github.com/example/stellarrail-web/actions/workflows/ci.yml/badge.svg)
![E2E](https://github.com/example/stellarrail-web/actions/workflows/e2e.yml/badge.svg)
![Image](https://img.shields.io/badge/image-ghcr.io-blue)

# StellarRail Web

Next.js 14 App Router + TypeScript strict + TanStack Query + Zustand + Tailwind + shadcn/UI.

## Structure

```
src/
  app/            # routes: (auth)/login+mfa, (dashboard)/payments+approvals+admin
  components/ui   # button input card dialog badge table skeleton toast
  components/layout # Header Sidebar Footer Banners
  components/auth # RequireRole
  features/{auth,payments,approvals,admin,audit}/ # api.ts + components/ + hooks/
  lib/            # env query-client flags formatters validators sanitize logger
  hooks/          # session, countdown, autosave, realtime
  stores/         # auth-store ui-store
  services/       # api-client
  mocks/          # MSW handlers + seed (12 payments)
  types/
```

## Setup (<5 min)

```bash
nvm use || true
cp .env.example .env.local
npm ci --no-audit --no-fund
npm run dev  # mock mode: NEXT_PUBLIC_USE_MOCK=true
```

Demo accounts: operator@stellarrail.test / approver@stellarrail.test / admin@stellarrail.test (password: password123, MFA: 123456).

## Scripts

- `npm run dev|build|start|lint|typecheck|test|test:coverage|format`

## Envs

See `.env.example`. Fail-fast validation in `src/lib/env.ts`.

## Mock mode

`NEXT_PUBLIC_USE_MOCK=true` enables MSW handlers for auth/payments/users/audit.

## Troubleshooting

- Peer-deps: `npm install --legacy-peer-deps`
- OOM: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`
- Never run dev/start in CI; use `npm run build`.
