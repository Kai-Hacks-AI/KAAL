# C80 do

## Placed Deliverables (`package-layout.json`)

The five drafts from `interface.md` and the `13-source` unit-test suite were placed into `engineering/testing/`:

- `engineering/testing/10-intent/I48-cases-are-well-formed/I48.md` (`testing/I48`)
- `engineering/testing/11-requirements/F173-verify-case/F173.md` (`testing/F173`, `serves: [testing/I48]`)
- `engineering/testing/12-architecture/A59-judge-verify-case/A59.md` (`testing/A59`, `addresses: [testing/F173]`)
- `engineering/testing/13-source/scripts/judge-verify-case.mjs` (exports `FORM_SCHEMA`, `EXEMPTIBLE_KINDS`, `judgeVerifyCase`, and CLI)
- `engineering/testing/13-source/unit-tests/judge-verify-case.test.mjs` (satisfies `13-source.verifiedBy: "unit-tests"`)
- `engineering/testing/14-operations/controls/CTL1-verify-case/CTL1.md` (`testing/CTL1`, `type: detective`, `status: designed`, `has: [testing/I48]`)

The five planned Cases (`testing/T397`–`testing/T401`) remained in place in their PLAN paths (`10-intent/test-cases/`, `11-requirements/test-cases/`, `12-architecture/test-cases/`, `14-operations/controls/CTL1-verify-case/`) without moving or renaming.

## Observed Results

- **Planned Cases (`testing/T397`–`testing/T401`):** **5/5 GREEN** in place against the delivered files (`I48.md`, `F173.md`, `A59.md`, `judge-verify-case.mjs`, `CTL1.md` match `interface.md` drafts byte-for-byte; `judgeVerifyCase` and CLI behaviour verified).
- **Unit tests (`node --test engineering/testing/13-source/unit-tests/judge-verify-case.test.mjs`):** **4/4 pass**, `0` fail.
- **Control discovery & validation:**
  - `find-controls.mjs engineering/testing`: lists `testing/CTL1` (`detective`, `designed`, `valid: true`, `problems: []`, `refused: []`, `tests: [testing/T401]`).
  - `check-controls.mjs engineering/testing`: `testing/CTL1 designed valid engineering\testing\14-operations\controls\CTL1-verify-case\CTL1.md`.
- **Case discovery (`collectCases('engineering/testing')`):** `totalDiscovered: 5`, `findings: []`, all 5 (`testing/T397`–`testing/T401`) unparked (`parked: false`).
- **Layout conformance (`check-layout.mjs` on staged `engineering/testing`):** `PASS` (exit `0`).

## Status & Boundaries

- `testing/CTL1` (`verify Case`) remains **`detective`** and **`designed`** (no CI or pre-push githook rollout yet).
- Upstream prerequisites (`@kaihacksai/kaal-hosting` AST source inspection, `kaal-testing` `readCase`/`C69` `checkCaseForm` upgrade, authoritative subject resolver, and `10-`..`15-` / phase-aware `cases.test.mjs` execution) remain separate subsequent Changes as documented in `change.md`.
