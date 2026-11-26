# C80 do

## Inert Placement (`package-layout.json`)

This DO is an **explicitly inert placement**: it places the approved deliverables into `engineering/testing/`, keeps `testing/CTL1` at `type: detective` and `status: designed`, performs no CI or githook wiring or activation, and makes no claim of real-tree readiness or end-to-end execution against real repository Cases until upstream prerequisites (1–4) land and reconcile `kaal-testing/case-form@1`.

Placed files:

- `engineering/testing/10-intent/I48-cases-are-well-formed/I48.md` (`testing/I48`)
- `engineering/testing/11-requirements/F173-verify-case/F173.md` (`testing/F173`, `serves: [testing/I48]`)
- `engineering/testing/12-architecture/A59-judge-verify-case/A59.md` (`testing/A59`, `addresses: [testing/F173]`)
- `engineering/testing/13-source/scripts/judge-verify-case.mjs` (exports `FORM_SCHEMA`, `EXEMPTIBLE_KINDS`, `judgeVerifyCase`, and CLI; only the 10 `F173`/`CTL1`-established failure kinds classify as `FAIL`, and unestablished/unknown kinds fall closed to `UNKNOWN`)
- `engineering/testing/13-source/unit-tests/judge-verify-case.test.mjs` (satisfies `13-source.verifiedBy: "unit-tests"`)
- `engineering/testing/14-operations/controls/CTL1-verify-case/CTL1.md` (`testing/CTL1`, `type: detective`, `status: designed`, `has: [testing/I48]`)

The five planned Cases (`testing/T397`–`testing/T401`) remained in place in their PLAN paths (`10-intent/test-cases/`, `11-requirements/test-cases/`, `12-architecture/test-cases/`, `14-operations/controls/CTL1-verify-case/`) without moving or renaming.

## Observed Placement & Consumer Checks

- **Planned Cases (`testing/T397`–`testing/T401`):** **5/5 GREEN** in place against the placed files and supplied `case-form@1` fixtures (`I48.md`, `F173.md`, `A59.md`, `judge-verify-case.mjs`, `CTL1.md` match `interface.md` drafts; `T399` explicitly verifies unestablished kinds such as `case-id`, `id-differs`, `target-missing`, `first-line`, and unknown kinds yield `UNKNOWN`, never false `FAIL` or `PASS`).
- **Unit tests (`node --test engineering/testing/13-source/unit-tests/judge-verify-case.test.mjs`):** **6/6 pass**, `0` fail.
- **Control discovery & validation:**
  - `find-controls.mjs engineering/testing`: lists `testing/CTL1` (`detective`, `designed`, `valid: true`, `problems: []`, `refused: []`, `tests: [testing/T401]`).
  - `check-controls.mjs engineering/testing`: `testing/CTL1 designed valid engineering/testing/14-operations/controls/CTL1-verify-case/CTL1.md`.
- **Case discovery (`collectCases('engineering/testing')`):** `totalDiscovered: 5`, `findings: []`, all 5 (`testing/T397`–`testing/T401`) unparked (`parked: false`).
- **Layout conformance (`check-layout.mjs` on staged `engineering/testing`):** `PASS` (exit `0`).

## Scope, Declared Evidence Obligation, and Boundaries

- `CTL1`'s `evidence: [fixture:2, real:1, provoked:1:fail]` is an **evidence obligation declared at `designed` status, not evidence already collected**.
- The checks above validate file placement, layout conformance, and consumer behavior against supplied `case-form@1` inputs only; they are **not** an end-to-end exercise of the producer-to-consumer chain on real repository Cases.
- Upstream prerequisites (`@kaihacksai/kaal-hosting` shared AST source inspection, `kaal-testing` `readCase` + `C69` `checkCaseForm` contract reconciliation, authoritative subject resolver, and `10-`..`15-` / phase-aware `cases.test.mjs` execution) remain separate subsequent Changes as documented in `change.md`.
