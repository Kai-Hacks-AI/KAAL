# C80 baseline

The baseline is `origin/main` at `559d26ee` (after promotion `#2263`, installing the controls ACT workflow).

- **Existing Case readers are inconsistent and miss structural defects:**
  - `engineering/cases/cases.test.mjs` discovers `engineering/<scope>/0[0-6]-*/**/T<n>.test.mjs` and checks `id` and `run`, but does not check `export const tests` or whether referenced subject ids exist.
  - `engineering/release-management/05-src/phase/lib/collector.mjs` (`applicableCases`) matches only single-quoted `export const id` and uses an unanchored `/export const tests = \[([^\]]*)\]/` regex that is shadowed by template strings (observed on `T1265`, `T1266`, `T1299` line 17).
  - `packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs` reads only line-1 comments (`// Case <id> tests: <targets>`), which silently diverge from `export const tests` when stale (observed on `T1265` and `T1266`).
- **No mechanical control verifies Case form and attribution before push or in CI.** An unattributed Case (`export const tests = []`, as rehearsed in our `release/CTL24` / `T1260` trial) or a stale header passes silently until a downstream consumer misreads or drops it.
- **Layout baseline:** `engineering/testing/` does not exist yet on `origin/main`; introducing it with `01-changes/C80-verify-case/` follows `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json` cleanly from the first Change (`judgeLayout` returns `PASS`).
- **Highest ids checked across `origin/main`, `testing/rt3-act`, and `origin/kaal/testing/act-library-sensitivity`:** `testing/C79`, `testing/I47`, `testing/F172`, `testing/A58`, `testing/T396`, no `testing/CTL*` yet. This PLAN takes `testing/C80`, `testing/I48`, `testing/F173`, `testing/A59`, `testing/CTL1`, and `testing/T397`–`testing/T401`.
