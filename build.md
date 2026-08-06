# BUILD PLAN: stellarrail-web — 70 Issues to Production Ready

> **Repo:** `stellarrail-web` (Next.js 14+ App Router, TypeScript, TanStack Query + Zustand, Tailwind + Shadcn/UI)
> **Source of truth:** `../PRD.md` + `../Architecture.md` > **Goal:** Production-ready web dashboard for Operators, Approvers, Admins (XLM-only, Testnet + Mainnet).

---

## AGENT EXECUTION PROMPT (MUST FOLLOW)

You are the builder agent for `stellarrail-web`. Execute issues **strictly sequentially from ISSUE-001 to ISSUE-070**.

Rules:

1. **One issue at a time.** Fully implement ISSUE-00X before starting ISSUE-00Y.
2. **Verify each issue** by running the listed verification commands (lint, typecheck, unit test, or build as specified). Fix failures before committing.
3. **Commit after EACH issue** — no batching, no skipping:
   ```bash
   git add -A
   git commit -m "<type>(web): <short description> [ISSUE-0XX]"
   ```
   Use the exact commit message given in each issue. If git repo not initialized, run `git init` once at ISSUE-001.
4. **Do not proceed** to the next issue with uncommitted changes or failing checks.
5. **Production-ready bar:** TypeScript strict, no `any` without justification, accessible (WCAG 2.1 AA), responsive (mobile/tablet/desktop), secure headers, env-validated, tested.
6. At ISSUE-068–070 you will set up **GitHub Actions workflows**. After ISSUE-070, the repo must have green CI on push/PR.
7. If an issue is already satisfied, still verify it, run its checks, and commit any missing piece (or an empty-commit with `--allow-empty` stating verified).

Commit types: `feat`, `fix`, `chore`, `test`, `docs`, `ci`, `style`, `refactor`, `perf`, `security`.

Start now at ISSUE-001.

---

## PHASE A — SCAFFOLD & TOOLCHAIN (001–010)

### ISSUE-001: Initialize Next.js 14 App Router + TypeScript strict

**Goal:** Bootstrapped app builds cleanly.
**Tasks:**

- `npx create-next-app@latest . --typescript --app --src-dir --import-alias "@/*" --tailwind --eslint` (or manual if dir non-empty).
- Enable `strict: true`, `noUncheckedIndexedAccess: true` in `tsconfig.json`.
- Add `src/app/layout.tsx`, `page.tsx` placeholder with StellarRail branding.
- Add `.nvmrc` (node 20), `.editorconfig`.
  **Acceptance:** `npm run build` succeeds, no TS errors.
  **Verify:** `npm run typecheck || npx tsc --noEmit; npm run build`
  **Commit:** `chore(web): init nextjs14 typescript strict [ISSUE-001]`

### ISSUE-002: Tailwind + Shadcn/UI + design tokens

**Goal:** Design system foundation per Architecture §2.1.
**Tasks:**

- Configure `tailwind.config.ts` with brand palette (deep navy, stellar accent), dark mode `class`.
- Install shadcn/ui deps (`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`), add `components.json`.
- Scaffold `src/components/ui/button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`, `badge.tsx`, `table.tsx`, `skeleton.tsx`, `toast.tsx`.
- Add `src/styles/globals.css` with CSS vars.
  **Acceptance:** Story/demo page renders all primitives.
  **Verify:** `npm run build`
  **Commit:** `feat(web): tailwind shadcn design tokens [ISSUE-002]`

### ISSUE-003: ESLint + Prettier + Husky + lint-staged

**Goal:** Enforced code quality.
**Tasks:**

- Add `eslint-config-next`, `prettier`, `husky`, `lint-staged`.
- `.prettierrc` (semi false? pick one and document), `.eslintrc.json` with `no-console` warn.
- Pre-commit hook: lint-staged runs eslint + prettier + tsc.
- Add scripts: `lint`, `format`, `typecheck`.
  **Acceptance:** `npm run lint` passes on clean tree.
  **Verify:** `npm run lint && npm run typecheck`
  **Commit:** `chore(web): eslint prettier husky [ISSUE-003]`

### ISSUE-004: Env config + validation (Zod)

**Goal:** Fail-fast on misconfigured envs.
**Tasks:**

- Create `src/lib/env.ts` with Zod schema: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STELLAR_NETWORK` (testnet|mainnet), `NEXT_PUBLIC_HORIZON_URL`, `NEXT_PUBLIC_SOROBAN_RPC_URL`.
- Validate at boot; throw readable error in dev.
- Add `.env.example`, `.env.local.example`.
  **Acceptance:** Missing env shows clear error, not silent fetch fail.
  **Verify:** `npm run typecheck`
  **Commit:** `feat(web): env validation zod [ISSUE-004]`

### ISSUE-005: Folder structure + path aliases + absolute imports

**Goal:** Scalable structure matching Architecture.
**Tasks:**

- Create `src/{app,components,features,lib,hooks,stores,services,types,mocks}`.
- `src/features/{auth,payments,approvals,admin,audit}` each with `components/`, `hooks/`, `api.ts`.
- Document structure in `README.md`.
  **Acceptance:** README diagram matches disk.
  **Verify:** `ls -R src | head -50`
  **Commit:** `chore(web): folder structure docs [ISSUE-005]`

### ISSUE-006: API client (fetch wrapper + JWT + refresh + idempotency)

**Goal:** Single resilient HTTP layer.
**Tasks:**

- `src/services/api-client.ts`: baseURL from env, attaches `Authorization: Bearer`, auto-refresh on 401 via `/auth/refresh`, retries once.
- Support `Idempotency-Key: uuid` header generation for POST `/payments`.
- Typed `ApiError` with `status`, `code`, `message`.
- Unit tests with mocked fetch.
  **Acceptance:** 401 triggers single refresh then retry; idempotency header present on payment POST.
  **Verify:** `npm run test -- api-client`
  **Commit:** `feat(web): api client jwt refresh idempotency [ISSUE-006]`

### ISSUE-007: State management (Zustand + TanStack Query)

**Goal:** Server/client state split per Architecture.
**Tasks:**

- Install `@tanstack/react-query`, `zustand`.
- `src/lib/query-client.ts` (staleTime 30s, retry 1, QueryClientProvider in `providers.tsx`).
- `src/stores/{auth-store,ui-store}.ts` (user, tokens, sidebar, toasts).
- Add React Query Devtools in dev only.
  **Acceptance:** Query provider wraps app, stores persist auth to localStorage securely (access token in memory + refresh in httpOnly note).
  **Verify:** `npm run typecheck`
  **Commit:** `feat(web): zustand tanstack query setup [ISSUE-007]`

### ISSUE-008: App shell (layout, nav, sidebar, role-aware)

**Goal:** Consistent chrome for all roles.
**Tasks:**

- `src/components/layout/{Header,Sidebar,Footer}.tsx`: logo, network badge (TESTNET amber / MAINNET red), user menu.
- Sidebar links filtered by role: Operator (New Payment, My Requests), Approver (Pending Queue), Admin (Users, Limits, Audit).
- Responsive collapse + mobile drawer.
  **Acceptance:** Snapshot of shell for each role.
  **Verify:** `npm run build`
  **Commit:** `feat(web): app shell role-aware nav [ISSUE-008]`

### ISSUE-009: Theming (light/dark) + typography + a11y baseline

**Goal:** Distinctive, accessible theme.
**Tasks:**

- `next-themes` ThemeProvider, toggle in header.
- Inter / Space Grotesk font pairing via `next/font`.
- Focus-visible rings, skip-to-content link, `lang="en"`, semantic landmarks.
  **Acceptance:** Lighthouse a11y ≥95 on home.
  **Verify:** manual + `npm run build`
  **Commit:** `feat(web): theming typography a11y baseline [ISSUE-009]`

### ISSUE-010: Mock server (MSW) + seed data

**Goal:** Develop without backend.
**Tasks:**

- Install `msw`, handlers for `/auth/*`, `/payments*`, `/users`, `/audit`.
- `src/mocks/seed.ts`: 12 payments across `DRAFT,LOCKED_IN_ESCROW,PENDING_APPROVAL,SETTLED,REFUNDED,FAILED`.
- Toggle via `NEXT_PUBLIC_USE_MOCK=true`.
  **Acceptance:** App fully navigable with mock on.
  **Verify:** `npm run test -- mocks`
  **Commit:** `chore(web): msw mocks seed data [ISSUE-010]`

---

## PHASE B — AUTH & RBAC (011–018)

### ISSUE-011: Login page (email/password + validation)

**Goal:** FR-1.1 login entry.
**Tasks:**

- `src/app/(auth)/login/page.tsx` with react-hook-form + zod (email, min 8 char password).
- Show field errors, generic "Invalid credentials" (no enumeration), loading state.
- On success store session, redirect by role.
  **Acceptance:** Invalid email blocked client-side; wrong creds shows generic error.
  **Verify:** `npm run test -- login`
  **Commit:** `feat(web): login page [ISSUE-011]`

### ISSUE-012: MFA TOTP challenge page

**Goal:** FR-1.2 second factor.
**Tasks:**

- `src/app/(auth)/mfa/page.tsx`: 6-digit input, auto-submit, 30s resend cooldown, backup-code link.
- Handle 3 attempts lockout message.
  **Acceptance:** Correct TOTP completes auth; wrong shows retry count.
  **Verify:** `npm run test -- mfa`
  **Commit:** `feat(web): mfa totp challenge [ISSUE-012]`

### ISSUE-013: Session management (access + refresh rotation)

**Goal:** FR-1.2 short-lived tokens.
**Tasks:**

- Access token in-memory (Zustand), refresh via httpOnly cookie call.
- Silent refresh 60s before expiry; logout on refresh fail.
- `useSession`, `useRequireAuth` hooks.
  **Acceptance:** Expired access auto-refreshes without UX interruption.
  **Verify:** `npm run test -- session`
  **Commit:** `feat(web): session refresh rotation [ISSUE-013]`

### ISSUE-014: Route guards + RBAC middleware

**Goal:** FR-1.3 enforcement client-side (defense in depth; server enforces).
**Tasks:**

- `middleware.ts` redirects unauthenticated to `/login`.
- `src/components/auth/RequireRole.tsx` (`roles: ['admin','approver','operator']`).
- 403 page for forbidden.
  **Acceptance:** Operator cannot visit `/admin/users` (redirect 403).
  **Verify:** `npm run test -- rbac`
  **Commit:** `feat(web): route guards rbac [ISSUE-014]`

### ISSUE-015: Logout + session expiry UX

**Goal:** Clean termination.
**Tasks:**

- Logout clears store + calls `POST /auth/logout`.
- Session-expired toast + redirect preserving `?next=`.
  **Acceptance:** Back button after logout does not reveal protected data.
  **Verify:** manual
  **Commit:** `feat(web): logout expiry ux [ISSUE-015]`

### ISSUE-016: Auth store persistence + cross-tab sync

**Goal:** Multi-tab correctness.
**Tasks:**

- Persist minimal user profile; sync logout across tabs via `storage` event / BroadcastChannel.
  **Acceptance:** Logout in tab A logs out tab B.
  **Verify:** manual
  **Commit:** `feat(web): auth cross-tab sync [ISSUE-016]`

### ISSUE-017: Password visibility + rate-limit feedback

**Goal:** Usability + brute-force UX per NFR Security.
**Tasks:**

- Show/hide toggle, caps-lock hint, "Too many attempts, try in Xs" from 429 `Retry-After`.
  **Acceptance:** 429 shows countdown.
  **Verify:** `npm run test -- auth-ui`
  **Commit:** `feat(web): password ux rate-limit [ISSUE-017]`

### ISSUE-018: Auth unit + integration tests

**Goal:** Lock auth behavior.
**Tasks:**

- Vitest for stores, api-client refresh, guards. Playwright stub (full e2e later).
  **Acceptance:** ≥80% coverage on `features/auth`.
  **Verify:** `npm run test -- features/auth --coverage`
  **Commit:** `test(web): auth coverage [ISSUE-018]`

---

## PHASE C — OPERATOR: PAYMENT REQUESTS (019–032)

### ISSUE-019: Operator dashboard (stats + recent)

**Goal:** Landing for Operators.
**Tasks:**

- Cards: Pending count, Settled this month, Total volume XLM, Failed count (from `GET /payments/stats` or mock).
- Recent requests table (5 rows) linking to detail.
  **Acceptance:** Empty state when no payments.
  **Verify:** `npm run build`
  **Commit:** `feat(web): operator dashboard [ISSUE-019]`

### ISSUE-020: Create payment form (destination, amount, memo, reference)

**Goal:** FR-2.1.
**Tasks:**

- `src/features/payments/components/CreatePaymentForm.tsx` with fields per PRD.
- Zod: Stellar `G...` 56-char validation, amount >0 max 8 decimals, memo ≤28 chars, referenceId unique client-side check.
  **Acceptance:** Invalid address blocked with helpful message + Stellar docs link.
  **Verify:** `npm run test -- create-payment`
  **Commit:** `feat(web): create payment form [ISSUE-020]`

### ISSUE-021: Stellar address validation + blocklist check UX

**Goal:** FR-2.2.
**Tasks:**

- Checksum validation (StrKey), `GET /blocklist/check?address=` async check with debounce, warning banner if blocked.
  **Acceptance:** Blocked address prevents submit with reason.
  **Verify:** `npm run test -- address-validation`
  **Commit:** `feat(web): address blocklist check [ISSUE-021]`

### ISSUE-022: Amount input (XLM precision, balance preview, fees)

**Goal:** Prevent precision errors.
**Tasks:**

- Stroop-safe input (7 decimals display, note 1 XLM = 10^7 stroops), available balance fetch, "Max" button, fee/network reserve explainer.
  **Acceptance:** Entering 8 decimals shows error.
  **Verify:** `npm run test -- amount`
  **Commit:** `feat(web): amount input precision [ISSUE-022]`

### ISSUE-023: Submit flow (DRAFT → LOCKED_IN_ESCROW → PENDING_APPROVAL)

**Goal:** FR-2.3/2.4 visualization.
**Tasks:**

- POST with idempotency key, optimistic DRAFT row, stepper UI showing transitions, poll `GET /payments/:id` until `PENDING_APPROVAL` or timeout.
- Timeout → "Queued — RPC degraded" notice per Architecture graceful degradation.
  **Acceptance:** Stepper animates through 3 states on mock.
  **Verify:** `npm run test -- submit-flow`
  **Commit:** `feat(web): submit flow stepper [ISSUE-023]`

### ISSUE-024: My requests list (filter, search, pagination, sort)

**Goal:** Operator tracking.
**Tasks:**

- TanStack Table: filters by status, search by destination/reference, server pagination (`page`, `limit`), sort by created/amount.
- URL-synced query params.
  **Acceptance:** Deep-linkable filtered view.
  **Verify:** `npm run test -- payments-list`
  **Commit:** `feat(web): my requests list [ISSUE-024]`

### ISSUE-025: Payment detail page (timeline, hashes, escrow info)

**Goal:** Reconciliation visibility FR-5.
**Tasks:**

- `src/app/(dashboard)/payments/[id]/page.tsx`: amount, dest (truncated + copy + explorer link), memo, status badge, timeline (CREATED→LOCKED→PENDING→SETTLED), tx hashes with Horizon/explorer links, escrow contract ID.
  **Acceptance:** All hashes link to correct network explorer.
  **Verify:** `npm run build`
  **Commit:** `feat(web): payment detail page [ISSUE-025]`

### ISSUE-026: Real-time status (polling + WebSocket fallback)

**Goal:** Architecture §2.1 realtime.
**Tasks:**

- `usePaymentStatus(id)`: poll every 5s when pending, WebSocket if `NEXT_PUBLIC_WS_URL` present, stop on terminal state, show "Live" dot.
  **Acceptance:** Status flips without reload on mock event.
  **Verify:** `npm run test -- realtime`
  **Commit:** `feat(web): realtime status polling [ISSUE-026]`

### ISSUE-027: Cancel/DRAFT editing

**Goal:** Draft ergonomics.
**Tasks:**

- Edit DRAFT fields, delete DRAFT with confirm dialog.
  **Acceptance:** Non-DRAFT not editable (disabled + tooltip).
  **Verify:** `npm run test -- draft-edit`
  **Commit:** `feat(web): draft edit cancel [ISSUE-027]`

### ISSUE-028: Copy, explorer links, QR for destination

**Goal:** Ops safety (fear of wrong address).
**Tasks:**

- Copy button with feedback, StellarExpert/explorer URL builder by network, QR code modal for destination.
  **Acceptance:** QR scans to correct address.
  **Verify:** manual
  **Commit:** `feat(web): copy explorer qr [ISSUE-028]`

### ISSUE-029: Notifications (toasts + inbox)

**Goal:** Approver ping + status changes.
**Tasks:**

- Sonner toasts on create/settle/refund/fail; notification bell with unread count (`GET /notifications`).
  **Acceptance:** Toast on mock settle.
  **Verify:** manual
  **Commit:** `feat(web): notifications toasts inbox [ISSUE-029]`

### ISSUE-030: Operator empty/loading/error states

**Goal:** Polished UX.
**Tasks:**

- Skeletons for tables/cards, empty illustrations, retry buttons, offline banner.
  **Acceptance:** Screenshots for each state in PR description pattern.
  **Verify:** manual
  **Commit:** `feat(web): operator states polish [ISSUE-030]`

### ISSUE-031: Operator form accessibility + keyboard

**Goal:** WCAG AA.
**Tasks:**

- Labels, aria-describedby errors, focus trap in modals, keyboard-submit, 44px targets.
  **Acceptance:** Full flow keyboard-only completable.
  **Verify:** `npx playwright test a11y` (or axe run)
  **Commit:** `a11y(web): operator keyboard access [ISSUE-031]`

### ISSUE-032: Operator tests (unit + e2e happy path)

**Goal:** Regression safety.
**Tasks:**

- Vitest for validators/hooks; Playwright: login→create→detail.
  **Acceptance:** E2E passes on mock.
  **Verify:** `npm run test && npx playwright test operator`
  **Commit:** `test(web): operator e2e [ISSUE-032]`

---

## PHASE D — APPROVER WORKFLOW (033–043)

### ISSUE-033: Pending queue dashboard

**Goal:** FR-3.1.
**Tasks:**

- Table of `PENDING_APPROVAL` sorted oldest-first (SLA risk), shows requester, amount, age, memo; bulk-select disabled (one-by-one per Non-Goal #4 — enforce single approve).
- Refresh + auto-poll 15s.
  **Acceptance:** Empty queue shows celebratory empty state.
  **Verify:** `npm run test -- pending-queue`
  **Commit:** `feat(web): pending queue [ISSUE-033]`

### ISSUE-034: Review drawer/modal (full context)

**Goal:** FR-3 context before signing.
**Tasks:**

- Slide-over with all fields, requester history (past approvals), risk flags (large amount > limit, new destination), escrow lock proof (tx hash).
  **Acceptance:** Approver sees limit comparison (e.g., "8,000 / 10,000 XLM limit").
  **Verify:** manual
  **Commit:** `feat(web): review drawer context [ISSUE-034]`

### ISSUE-035: Approve action (confirm + idempotency)

**Goal:** FR-3.3.
**Tasks:**

- Confirm modal typing amount or checkbox "I verified destination", POST `/payments/:id/approve` with idempotency key, optimistic `SETTLING` then `SETTLED`.
  **Acceptance:** Double-click does not double-submit (button disabled + key).
  **Verify:** `npm run test -- approve`
  **Commit:** `feat(web): approve action [ISSUE-035]`

### ISSUE-036: Reject action (reason required → REFUNDED)

**Goal:** FR-3.4.
**Tasks:**

- Reject modal with reason dropdown + note (required), POST `/payments/:id/reject`, timeline shows `REFUNDED`.
  **Acceptance:** Empty reason blocked.
  **Verify:** `npm run test -- reject`
  **Commit:** `feat(web): reject action [ISSUE-036]`

### ISSUE-037: Separation-of-duties enforcement UX

**Goal:** FR-3.5.
**Tasks:**

- If `requesterId === currentUser.id`, disable Approve/Reject with tooltip "You cannot approve your own request", show banner. Still allow Admin override view (read-only note that server will 403).
  **Acceptance:** Own request shows disabled buttons in test.
  **Verify:** `npm run test -- sod`
  **Commit:** `feat(web): sod enforcement ux [ISSUE-037]`

### ISSUE-038: Approval history + filters

**Goal:** Accountability.
**Tasks:**

- Tabs: Pending / Approved by me / Rejected by me / All; export filtered CSV client-side.
  **Acceptance:** Filter persists in URL.
  **Verify:** manual
  **Commit:** `feat(web): approval history [ISSUE-038]`

### ISSUE-039: SLA / expiry countdown

**Goal:** FR-4.4 visibility.
**Tasks:**

- Countdown to `deadline` per row + detail; "Expiring soon <1h" amber, "Expired" gray; tooltip explains auto-refund callable by anyone.
  **Acceptance:** Mock expiring item shows live countdown.
  **Verify:** `npm run test -- expiry`
  **Commit:** `feat(web): expiry countdown [ISSUE-039]`

### ISSUE-040: Approver notifications + sound/badge

**Goal:** <10min time-to-payment KPI.
**Tasks:**

- Badge count on sidebar, optional sound toggle, browser Notification API opt-in for new pending.
  **Acceptance:** New mock pending increments badge.
  **Verify:** manual
  **Commit:** `feat(web): approver notifications [ISSUE-040]`

### ISSUE-041: Approver mobile companion layout

**Goal:** Roadmap v2.1 preview — usable on phone.
**Tasks:**

- Card-list alternative to table <768px, big Approve/Reject buttons, sticky action bar on detail.
  **Acceptance:** Playwright mobile viewport passes approve flow.
  **Verify:** `npx playwright test --project=mobile approver`
  **Commit:** `feat(web): approver mobile layout [ISSUE-041]`

### ISSUE-042: Approver tests

**Goal:** Critical path covered.
**Tasks:**

- Unit: SoD logic, countdown; E2E: approve + reject flows with reason.
  **Acceptance:** E2E green on mock.
  **Verify:** `npx playwright test approver`
  **Commit:** `test(web): approver e2e [ISSUE-042]`

### ISSUE-043: Time-to-payment widget (KPI)

**Goal:** PRD §6 KPI #1.
**Tasks:**

- Chart (avg request→settle last 30d) via recharts, target line 10min.
  **Acceptance:** Renders with mock data, empty state without.
  **Verify:** `npm run build`
  **Commit:** `feat(web): time-to-payment widget [ISSUE-043]`

---

## PHASE E — ADMIN & AUDIT (044–053)

### ISSUE-044: Admin users page (CRUD + roles)

**Goal:** Admin persona.
**Tasks:**

- Table `GET /users`, invite modal (email+role), change role, deactivate, reset MFA. Role badges.
  **Acceptance:** Only `admin` role sees page (guard test).
  **Verify:** `npm run test -- admin-users`
  **Commit:** `feat(web): admin users crud [ISSUE-044]`

### ISSUE-045: Spending limits config

**Goal:** Admin sets limits.
**Tasks:**

- Form `GET/PUT /config/limits`: per-role daily limit, per-tx limit, require-2-approvers threshold. Validation + confirm.
  **Acceptance:** Exceeding amount shows warning downstream (linked to ISSUE-034 flag).
  **Verify:** manual
  **Commit:** `feat(web): spending limits config [ISSUE-045]`

### ISSUE-046: Network endpoints config (read-only + switch)

**Goal:** Testnet/Mainnet safety.
**Tasks:**

- Display Horizon/RPC/contract ID per env, network switcher with scary confirm for Mainnet ("You are on MAINNET — real funds"), persistent banner.
  **Acceptance:** Mainnet banner always visible on mainnet.
  **Verify:** manual
  **Commit:** `feat(web): network config banner [ISSUE-046]`

### ISSUE-047: Audit logs viewer (filter + detail)

**Goal:** FR-6.
**Tasks:**

- Paginated table `GET /audit`: timestamp, actor, action, payload hash, IP; click → JSON drawer; filters by actor/action/date.
  **Acceptance:** 100% of mock actions have log entries viewable.
  **Verify:** `npm run test -- audit-view`
  **Commit:** `feat(web): audit logs viewer [ISSUE-047]`

### ISSUE-048: Audit export (CSV/JSON)

**Goal:** FR-6.2 compliance export.
**Tasks:**

- Export current filter as CSV/JSON client-side (Blob download), filename `audit-YYYYMMDD-HHmm.csv`, max 10k rows guard.
  **Acceptance:** Exported CSV opens in Excel with headers.
  **Verify:** manual
  **Commit:** `feat(web): audit export [ISSUE-048]`

### ISSUE-049: System health + reconciliation status

**Goal:** Observability surface.
**Tasks:**

- Card `GET /health`: API uptime, Horizon latency, RPC latency, queue depth, last reconciliation run + mismatches count.
  **Acceptance:** Degraded RPC shows amber banner globally.
  **Verify:** manual
  **Commit:** `feat(web): health reconciliation status [ISSUE-049]`

### ISSUE-050: Admin guards + tests

**Goal:** Lock admin.
**Tasks:**

- Tests for guards, export, limits validation.
  **Acceptance:** Non-admin e2e gets 403.
  **Verify:** `npx playwright test admin`
  **Commit:** `test(web): admin guards [ISSUE-050]`

### ISSUE-051: Error boundaries + 404/500 pages

**Goal:** Graceful failure.
**Tasks:**

- `error.tsx`, `not-found.tsx`, `global-error.tsx` with retry + report ID.
  **Acceptance:** Throw in mock detail shows friendly error with retry.
  **Verify:** manual
  **Commit:** `feat(web): error boundaries pages [ISSUE-051]`

### ISSUE-052: i18n-ready + GDPR deletion request UI

**Goal:** NFR Compliance.
**Tasks:**

- `next-intl` scaffolding (en only), all strings via `t()`, Account page "Request data deletion" → `DELETE /users/me` confirm flow.
  **Acceptance:** No hardcoded user-facing strings in new features (lint rule or review).
  **Verify:** `npm run typecheck`
  **Commit:** `feat(web): i18n gdpr deletion [ISSUE-052]`

### ISSUE-053: Docs (README, onboarding, runbook link)

**Goal:** Operability.
**Tasks:**

- README: setup, envs, scripts, mock mode, roles demo accounts, screenshots placeholders, troubleshooting.
  **Acceptance:** Fresh clone → running in <5 min following README.
  **Verify:** peer-run README once
  **Commit:** `docs(web): readme onboarding [ISSUE-053]`

---

## PHASE F — HARDENING, PERF, TEST (054–067)

### ISSUE-054: Security headers + CSP + cookies

**Goal:** NFR Security, Arch §5.3 XSS/CSRF.
**Tasks:**

- `next.config.js` headers: CSP, `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options`, `Referrer-Policy`; SameSite=Lax cookies; no token in URL.
  **Acceptance:** Security Headers scan B+ minimum locally.
  **Verify:** `npm run build && npx next lint`
  **Commit:** `security(web): headers csp cookies [ISSUE-054]`

### ISSUE-055: Input sanitization + memo XSS tests

**Goal:** XSS prevention.
**Tasks:**

- Sanitize memo/reference rendering (React escaping + no dangerouslySetInnerHTML; if needed DOMPurify), tests with `<script>` payloads.
  **Acceptance:** Payload renders as text, not executed.
  **Verify:** `npm run test -- xss`
  **Commit:** `security(web): xss sanitization [ISSUE-055]`

### ISSUE-056: Rate-limit + retry UX (429/5xx/queue)

**Goal:** Graceful degradation if RPC down.
**Tasks:**

- Global fetch retry with backoff for GET (max 2), queued banner "Network degraded — retrying", disable submit while degraded except DRAFT save.
  **Acceptance:** Mock 503 shows banner, not crash.
  **Verify:** `npm run test -- resilience`
  **Commit:** `feat(web): retry degraded ux [ISSUE-056]`

### ISSUE-057: Performance (code-split, images, bundle budget)

**Goal:** NFR <200ms API-driven + fast TTI.
**Tasks:**

- Dynamic import heavy modals/charts, `next/image`, bundle-analyzer, budget <350KB first load (warn in CI).
- Add `loading.tsx` skeletons per route.
  **Acceptance:** Lighthouse perf ≥85 on dashboard.
  **Verify:** `ANALYZE=true npm run build`
  **Commit:** `perf(web): code-split bundle budget [ISSUE-057]`

### ISSUE-058: SEO / metadata / OG

**Goal:** Marketing-ready shell.
**Tasks:**

- `metadata` per layout, OG tags, favicon, `robots.ts`, `sitemap.ts`.
  **Acceptance:** `npm run build` emits metadata without warnings.
  **Verify:** `npm run build`
  **Commit:** `feat(web): seo metadata [ISSUE-058]`

### ISSUE-059: Unit test expansion (Vitest + RTL, ≥70% stmts)

**Goal:** Confidence.
**Tasks:**

- Cover validators, formatters (XLM/stroops, dates), stores, hooks. Add `npm run test:coverage` threshold 70.
  **Acceptance:** Coverage gate passes.
  **Verify:** `npm run test:coverage`
  **Commit:** `test(web): unit coverage 70 [ISSUE-059]`

### ISSUE-060: E2E suite (Playwright: auth, operator, approver, admin)

**Goal:** Release gate.
**Tasks:**

- `playwright.config.ts` (chromium, mobile), fixtures (login as each role), 12 specs, traces on failure.
  **Acceptance:** `npx playwright test` green on mock + CI.
  **Verify:** `npx playwright test --reporter=list`
  **Commit:** `test(web): playwright e2e suite [ISSUE-060]`

### ISSUE-061: Visual regression (snapshots for critical pages)

**Goal:** Prevent UI drift.
**Tasks:**

- Playwright screenshot assertions for login, dashboards, detail; store in `__screenshots__`.
  **Acceptance:** Baseline committed, diff threshold documented.
  **Verify:** `npx playwright test visual`
  **Commit:** `test(web): visual regression [ISSUE-061]`

### ISSUE-062: Accessibility audit (axe + keyboard + contrast)

**Goal:** WCAG 2.1 AA.
**Tasks:**

- `@axe-core/playwright` automated checks on all routes, fix contrast/focus/labels, document exceptions.
  **Acceptance:** Zero critical/serious axe violations.
  **Verify:** `npx playwright test a11y`
  **Commit:** `a11y(web): axe audit zero critical [ISSUE-062]`

### ISSUE-063: Observability (Sentry + Web Vitals + logging)

**Goal:** Pilot monitoring.
**Tasks:**

- Sentry init (client/server/edge, only prod), Web Vitals report, structured client logger (no PII), user feedback on error boundary.
  **Acceptance:** Test Sentry event in staging (docs).
  **Verify:** `npm run build`
  **Commit:** `feat(web): sentry vitals logging [ISSUE-063]`

### ISSUE-064: PWA-ish + offline queue (DRAFT autosave)

**Goal:** Ops resilience.
**Tasks:**

- Autosave DRAFT to localStorage every 10s, restore on return, "Offline — changes saved locally" banner via `navigator.onLine`.
  **Acceptance:** Reload mid-form restores values.
  **Verify:** manual
  **Commit:** `feat(web): draft autosave offline [ISSUE-064]`

### ISSUE-065: Feature flags + maintenance mode

**Goal:** Safe rollout (RC1 read-only mode per PRD §7).
**Tasks:**

- `src/lib/flags.ts` (env + cookie override): `readOnlyMode`, `enableMfa`, `enableNotifications`; maintenance page when `NEXT_PUBLIC_MAINTENANCE=true`.
  **Acceptance:** Read-only hides all mutating buttons with banner.
  **Verify:** `npm run test -- flags`
  **Commit:** `feat(web): feature flags readonly [ISSUE-065]`

### ISSUE-066: Dockerfile (multi-stage, non-root, standalone)

**Goal:** Deployable image.
**Tasks:**

- `Dockerfile` (node:20-alpine, deps→build→runner, `output: 'standalone'`, non-root `nextjs` user), `.dockerignore`, `npm run docker:build && docker run` smoke test docs.
  **Acceptance:** `docker build -t stellarrail-web:local .` succeeds, serves on 3000.
  **Verify:** `docker build -t stellarrail-web:local .`
  **Commit:** `chore(web): dockerfile standalone [ISSUE-066]`

### ISSUE-067: Production checklist (envs, domains, redirects, analytics consent)

**Goal:** Pre-release gate.
**Tasks:**

- `docs/PRODUCTION.md`: required envs, preview vs prod URLs, auth callback, cookie domain, consent banner, backup of flags.
- Add cookie-consent banner (GDPR).
  **Acceptance:** Checklist fully ticked in file.
  **Verify:** manual review
  **Commit:** `docs(web): production checklist [ISSUE-067]`

---

## PHASE G — CI/CD WORKFLOWS (068–070) ★ REQUIRED

### ISSUE-068: GitHub Actions — CI (lint, typecheck, unit, build)

**Goal:** Every push/PR gated.
**Tasks:**

- Create `.github/workflows/ci.yml`:
  - `on: [push, pull_request]`, Node 20, npm cache.
  - Jobs: `lint` (eslint), `typecheck` (tsc), `test` (vitest coverage), `build` (next build), `a11y` (axe playwright, allow failure initially → then required), upload coverage + playwright traces as artifacts.
  - Branch protection documented in `docs/BRANCH_PROTECTION.md` (require CI green).
    **Acceptance:** Workflow runs green on this commit; badge added to README.
    **Verify:** `gh workflow view ci || cat .github/workflows/ci.yml; npm run lint && npm run typecheck`
    **Commit:** `ci(web): github actions ci pipeline [ISSUE-068]`

### ISSUE-069: GitHub Actions — E2E + Docker publish

**Goal:** Release confidence + image supply.
**Tasks:**

- `.github/workflows/e2e.yml`: Playwright (sharded, mock mode, upload `playwright-report`).
- `.github/workflows/docker.yml`: on tags `v*` + `main`: buildx, push to GHCR (`ghcr.io/<org>/stellarrail-web`), cosign-style provenance (attest), image labels with SHA.
  **Acceptance:** `docker pull` of CI-built image runs.
  **Verify:** inspect YAML + `docker build` locally
  **Commit:** `ci(web): e2e docker publish workflows [ISSUE-069]`

### ISSUE-070: GitHub Actions — Preview deploys + release gate + badges

**Goal:** Production-ready delivery.
**Tasks:**

- `.github/workflows/preview.yml` (Vercel or Netlify or ECS preview — pick one, document): deploys PR previews with mock API, comments URL on PR.
- `.github/workflows/release.yml`: on `v*` tag runs full CI+E2E, builds Docker, creates GitHub Release with changelog (`git log`), requires `docs/PRODUCTION.md` checklist tick.
- README badges (CI, E2E, image), `CHANGELOG.md` init, `LICENSE` check.
- Final verification: `npm run lint && npm run typecheck && npm run test && npm run build` all green, then tag `web-v1.0.0-rc1`.
  **Acceptance:** All 4 workflows present and valid YAML (`actionlint` or `gh workflow list`), README badges render, repo tagged.
  **Verify:** `ls .github/workflows/ && npm run lint && npm run typecheck && npm run build`
  **Commit:** `ci(web): preview release workflows v1rc1 [ISSUE-070]`

---

## DONE DEFINITION

- [ ] All 70 issues committed sequentially (70 commits minimum).
- [ ] `npm run lint`, `typecheck`, `test`, `build` green.
- [ ] Playwright E2E green.
- [ ] `.github/workflows/{ci,e2e,docker,preview,release}.yml` present and passing.
- [ ] `Dockerfile` builds and runs.
- [ ] README + PRODUCTION checklist complete.
- [ ] Tag `web-v1.0.0-rc1` pushed.

_End of stellarrail-web build plan._
