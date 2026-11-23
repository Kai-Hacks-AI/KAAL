# ACT library sensitivity: Requirements

Each Requirement answers `testing/I47`.

## Claims, registered before the pilot

The claims are taken from the library's own comments and code at `main`, and fixed here so the pilot cannot choose them afterwards. A claim the pilot cannot challenge is reported untested, with why.

| Claim | Statement | Where |
| --- | --- | --- |
| K1 | no applicable Case gives UNKNOWN, never PASS | `casesAreGreen` |
| K2 | a parked (`.red.mjs`) Case fails, even if observed GREEN | `casesAreGreen` |
| K3 | an observed RED Case fails | `casesAreGreen` |
| K4 | a Case not observed GREEN gives UNKNOWN, never PASS | `casesAreGreen` |
| K5 | PASS only when every applicable Case is unparked and observed GREEN, and the counts say so | `casesAreGreen` |
| K6 | the Cases of all carried Changes are judged together, and a parked duplicate cannot be hidden by a later copy of its id | `applicableCasesAreGreen` |
| K7 | `judgeAct` answers only for a known `acted`: unknown gives UNKNOWN, false gives PASS "not applicable", true gives the Cases' verdict | `judgeAct` |
| K8 | `judgeHold` gives UNKNOWN for carried Changes or retros it cannot read and for an unqualified reflected id, PASS "not applicable" when no retro reflects a carried Change, and otherwise the Cases' verdict | `judgeHold` |

## Functional

- **testing/F170** [testing/I47]: **A pinned, attributable pilot.** `testing/C79` records the commit SHA of the code it challenges and the exact `from`/`to` of every mutant, in `plan/act-library-sensitivity/pilot.md`. It confirms that each mutant was really loaded by the Cases (a hook interception check), preserves unrelated valid behaviour when challenging one claim, and attributes each kill to the specific Case and assertion that detects it, keeping unrelated errors apart. It runs release's own Cases with release's own runner, from a scratch copy of the tree, so no file of the repository is changed.
- **testing/F171** [testing/I47]: **PASS-widening mutants, at least twelve.** For each claim the pilot challenges, it introduces at least one mutant that would let a wrong answer reach PASS or soften FAIL to UNKNOWN (for example: drop the empty check, ignore `parked`, treat UNKNOWN as GREEN, drop the final findings check, let a later duplicate override `parked`, skip the `acted` validity check, drop the unqualified-id check, invert the no-retro test), and in all at least twelve. Each ends as `killed`, `survived`, `invalid` or `unresolved`, and each is a row of the table below. Every claim K1–K8 has at least one row or is marked untested with a reason.
- **testing/F172** [testing/I47]: **Handover, not a fix.** Each row is judged in the five columns `Authoritative claim | Mutation | Witness | Observation | Judgment`. For a survivor the judgment is one of `required invariant` (a Case Testing justifies and release lands), `equivalent change`, `unknown`, `architectural concern`, `potential defect`, `proposed clarification` or `out of scope`. Testing hands the survivors to release as findings and the justified Cases as text. It writes no Case into release's tree and changes no release file. A survivor that breaches a documented contract goes to the Defect flow, not to a silent fix.

## Nonfunctional

- **testing/N38** [testing/I47]: **Evidence, not a harness; the repository untouched.** The mutation runner is temporary and not committed. The Change adds only files under `packages/kaal-testing/plan/act-library-sensitivity/` and its Cases, no export, no dependency and no `scripts.test` entry beyond its own aggregate. Testing decides no verdict: the table reports what the Cases did and did not reject.
