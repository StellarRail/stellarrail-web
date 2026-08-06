# Production Checklist

- [x] Required envs set: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STELLAR_NETWORK, NEXT_PUBLIC_HORIZON_URL, NEXT_PUBLIC_SOROBAN_RPC_URL
- [x] Preview URL vs prod URL documented (Vercel preview per-PR, prod https://stellarrail.example)
- [x] Auth callback / cookie domain: SameSite=Lax, httpOnly refresh cookie, no token in URL
- [x] Cookie-consent banner enabled (GDPR)
- [x] Feature flags backed up: NEXT_PUBLIC_READONLY, NEXT_PUBLIC_MAINTENANCE, NEXT_PUBLIC_ENABLE_MFA
- [x] Sentry DSN configured for prod only
- [x] Security headers verified (CSP, HSTS, frame-ancestors none)
