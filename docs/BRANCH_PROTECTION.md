# Branch Protection

Require green CI on `main`:

- `lint`, `typecheck`, `test`, `build` jobs in `.github/workflows/ci.yml`
- Require pull-request reviews: 1
- Require status checks: CI
- See repo Settings → Branches → Add rule for `main`.
