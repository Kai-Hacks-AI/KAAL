# Engineering's Defect register for Guard

> PLAN (engineering/C8): nothing below exists yet. The Owner's release decision on #638 (comment 6509672482) is that Guard 0.0.5 is neither promoted nor published until Engineering's legacy Defect register is corrected. That register is the Defect tables in [testing.md](testing.md#defects). Engineering owns it. This PLAN aligns it with the product's model: the [Limitations](../../packages/kaal-guard/docs/limitations.md#defects-in-published-versions), and `guard/C123`, #583 and #638. It is revised to the Owner's re-review (5717455068): Guard defines guard/D6–guard/D14 and guard/D18 through `guard/C132` (#653), and Engineering keeps only guard/D4 and guard/D15. Approving this PLAN authorizes only the engineering/C8 DO, on `kaal/guard-release`.

## The model it follows

These are the Owner's and the product's rules. They are not restated as Engineering's own.

- **A Defect is a durable statement of prohibited behaviour,** a negative Requirement. It has no status.
- **Traces go from Test Case to Defect, outgoing only.** A Test Case names the Defects it tests in its title, beside the Requirements it verifies.
- **"Tested by" is derived** from those titles and never written by hand.
- **RED and GREEN are observations,** each tied to a version or commit and a Test Run. A RED establishes the Defect there. A GREEN evidences its correction from there, within the case's scope. A later GREEN never erases a RED, and no permanent status is inferred from a GREEN.
- **The register cites Guard's product-owned Defects and never redefines them.**

## What is wrong with the register today

| Today | Correction |
| --- | --- |
| A "Traces to" column goes from Defect to Test Case | Removed. The trace is in the Test Case's title |
| "Status": "suspected", "established", "corrected", "retracted" | Removed. Each RED and GREEN is recorded as an observation, with its version or commit and the Test Run (the pull request whose check recorded it) |
| D6–D14 still read "suspected (`guard/C61`)", although `guard/C63` (#433) recorded all nine RED. D6–D14 and D18 are defined here, although they are Guard's | Cited as `(product)`. Guard defines them and records their observations through `guard/C132` (#653) |
| The prose says "When a corrective Change turns the T GREEN, the D is corrected" | Replaced by the model above |

## The register, as the DO writes it

The table becomes `| Defect | Prohibited behaviour | Tested by | Observed in Test Runs |`, the same columns as the Limitations. "Tested by" is derived from the Test Case titles by `verify-manifest.mjs`, between markers, as the package's trace already is. Nobody writes it by hand.

**Defects Engineering defines: guard/D4 and guard/D15 only.** Each observation names the same four things as `guard/C132` (#653) requires of the product's: its result, RED or GREEN; the candidate (version, `packed` or `registry`, and commit, where recorded); the environment (OS and Node version, where recorded, and nothing claimed where not); and the Test Run, meaning the Change and its pull request or the CI run.

| Defect | Test Case | Observed in Test Runs |
| --- | --- | --- |
| guard/D4 | guard/T44 (Engineering, retired) | RED: `0.0.1`, `packed`, Linux, in K2b. Then the Owner's ruling on #336 (`guard/C23`) withdrew the contract it stated. That is a change of definition, recorded as such, not a status and not a GREEN |
| guard/D15 | guard/T93 (Engineering) | RED: on `kaal/guard`, in `guard/C73` (#441). GREEN: from `guard/C74` (#442) |

The DO checks each pull request's recorded check results before writing an entry. An entry it cannot evidence that way is left out and named as unobserved, never guessed. Under `guard/C129` (#631), guard/T93 moves to External's own Test Plan, and guard/D15 moves with it. Until then, it stays here.

**Defects the product defines: cited, never redefined.** guard/D1–guard/D3, guard/D5, guard/D16 and guard/D17 (published versions), and guard/D6–guard/D14 and guard/D18 (found before a release, `guard/C132`), appear only as `| guard/Dn (product) |`. They carry no prohibited behaviour, Tested by or observation of their own. Their definitions, derived traces and candidate- and environment-scoped observations are the Limitations' alone, so this register holds no second copy of the RED and GREEN that `guard/C132` records.

## Who defines which Defect: decided

The Owner chose option A on this PLAN, approved it on #646 (`guard/C131`), and confirmed it in review 5717455068:

- **Guard defines** guard/D6–guard/D14 and guard/D18, the prohibited behaviour of Guard itself found in a candidate before it was released. `guard/C132` (#653) adds them to the Limitations and to the titles of guard/T84–guard/T92 and guard/T100.
- **Engineering defines** only guard/D4 (guard/T44, withdrawn) and guard/D15 (guard/T93, the External delivery's workflow, outside the package). Defect ownership follows the owner of the prohibited behaviour, not where the Test Case lives.
- guard/T111 keeps finding every Defect defined exactly once. Engineering writes nothing in `packages/kaal-guard/`.

## Engineering's own Test Case titles

- guard/T93's title, in `engineering/guard/acceptance/external.test.mjs`, adds guard/D15.
- guard/T44 is retired and has no running case. Its plan row in [testing.md](testing.md#planned-outer-tests) names guard/D4 as the Defect it tested, and that row is its title.

## Test Cases

These are written RED first, against today's register, and live beside guard/T111 in `engineering/guard/acceptance/authority.test.mjs`. Their numbers are allocated by Guard's numbering and confirmed in the DO.

| Checks | RED today because |
| --- | --- |
| No register table has a "Traces to" or a "Status" column. Each has exactly the Limitations' columns | the tables have both |
| Every "Tested by" cell equals the set derived from Test Case titles, and none is written outside the generated markers | the column does not exist |
| Every observation names RED or GREEN, a version or commit, and a pull request. No row says "corrected", "established" or "suspected" as a state | the rows say all three |
| A Defect the Limitations define, in either of their tables, appears in the register only as `(product)`, with no prohibited behaviour, Tested by or observation of its own. Only guard/D4 and guard/D15 are defined here | the six cited rows still carry "Traces to", "Gap" and "Status", and D6–D14 and D18 are defined here |
| **Reverse direction.** A fixture register row that traces a Defect to a Test Case, by a "Traces to" cell or a Test Case named in its own cell, is refused, and so is a hand-written "Tested by" | the register traces Defect → Test Case today |
| **Invented status.** A fixture row carrying a status, such as "corrected", "established", "suspected" or a GREEN written as a lasting state, or a "Status" column, is refused | every register table has a "Status" column |
| **Unscoped observation.** A fixture observation that names no candidate or no Test Run, or claims an environment the run did not record, is refused, naming the Defect | the rows name neither |
| **Duplicate authority.** A fixture register that defines a Defect the Limitations define, or defines one Defect twice, is refused, naming both places | the six cited rows still carry their own gap and status |

## Order

1. **`guard/C132`'s DO** (#653's PLAN) defines guard/D6–guard/D14 and guard/D18 in the package and adds them to their Test Cases' titles, on `kaal/guard-release`.
2. **The engineering/C8 DO**, on `kaal/guard-release` after step 1, written RED first. Its pull request shows guard/T111 GREEN, with every Defect defined exactly once, on its merge with step 1's head, and it follows that head if it changes.
3. **guard/T130 GREEN** on the exact candidate SHA (`guard/C131`), before `guard/C125`.

Approving this PLAN authorizes the engineering/C8 DO only. It authorizes no synchronization, promotion or publication, and nothing in `packages/kaal-guard/`.
