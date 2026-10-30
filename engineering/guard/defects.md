# Engineering's Defect register for Guard

> PLAN (engineering/C8): nothing below exists yet. The Owner's release decision on #638 (comment 6509672482) is that Guard 0.0.5 is neither promoted nor published until Engineering's legacy Defect register is corrected. That register is the Defect tables in [testing.md](testing.md#defects). Engineering owns it. This PLAN aligns it with the product's model: the [Limitations](../../packages/kaal-guard/docs/limitations.md#defects-in-published-versions), and `guard/C123`, #583 and #638. Approving this PLAN authorizes only the engineering/C8 DO, on `kaal/guard-release`.

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
| D6–D14 still read "suspected (`guard/C61`)", although `guard/C63` (#433) recorded all nine RED | Recorded as observed |
| The prose says "When a corrective Change turns the T GREEN, the D is corrected" | Replaced by the model above |

## The register, as the DO writes it

The table becomes `| Defect | Prohibited behaviour | Tested by | Observed in Test Runs |`, the same columns as the Limitations. "Tested by" is generated from the Test Case titles by `verify-manifest.mjs`, between markers, as the package's trace already is. It is never edited by hand.

The observations below are read from the pull requests named:

| Defect (`guard/D…`) | Test Case (`guard/T…`) | RED | GREEN |
| --- | --- | --- | --- |
| D4 | T44 (Engineering) | K2b, `packed`, Linux, against `0.0.1` | None. The Defect was **retracted** by the Owner's ruling on #336, in `guard/C23`, so it is withdrawn as a wrong contract, not corrected |
| D6 | T84 | kaal/guard, `guard/C63` (#433) | `guard/C64` (#435) |
| D7 | T85 | `guard/C63` (#433) | `guard/C65` (#436) |
| D8 | T86 | `guard/C63` (#433) | `guard/C65` (#436) |
| D9 | T87 | `guard/C63` (#433) | `guard/C68` (#439) |
| D10 | T88 | `guard/C63` (#433) | `guard/C66` (#437) |
| D11 | T89 | `guard/C63` (#433) | `guard/C67` (#438) |
| D12 | T90 | `guard/C63` (#433) | `guard/C66` (#437) |
| D13 | T91 | `guard/C63` (#433) | `guard/C64` (#435) |
| D14 | T92 | `guard/C63` (#433) | `guard/C67` (#438) |
| D15 | T93 (Engineering) | kaal/guard, `guard/C73` (#441) | `guard/C74` (#442) |
| D18 | T100 | the uncorrected runner, in `guard/C92`'s pull request (#505) | `guard/C92` (#505) |

The DO checks each pull request's recorded check results before writing a row. A row it cannot evidence that way is written as unobserved, not guessed.

guard/D1, D2, D3, D5, D16 and D17 stay cited as `| guard/D<n> (product) | …`, as #638 left them. Their definition, "Tested by" and observations stay the Limitations' alone.

## Who defines which Defect: the one question for the Owner

A product Test Case can cite only identifiers the package defines. guard/T111 enforces this, and #638 kept it. guard/T84–guard/T92 (`packages/kaal-guard/test/acceptance/requirements.test.mjs`) and guard/T100 (`packages/kaal-guard/test/unit/runner.test.mjs`) are product cases. So their titles cannot name D6–D14 or D18 while Engineering's register defines them.

- **A (recommended).** D6–D14 and D18 are prohibited behaviour of Guard itself, found in a candidate before it was released. Guard defines them in its product documents, and its Change adds them to those Test Cases' titles. Engineering's register then cites them as `(product)`, and defines only the two whose prohibited behaviour is in a concern or realization Engineering owns. Defect ownership follows the owner of the prohibited behaviour, not the Test Case's location:
  - guard/D4, tested by guard/T44 and retracted;
  - guard/D15, tested by guard/T93: the External delivery's workflow, outside the package.

  This needs one Guard Change, landing before this DO, both on `kaal/guard-release`.
- **B.** Engineering keeps defining D6–D14 and D18, and the package admits citations of Engineering-defined Defects in a separate, undelivered form. That loosens guard/T111, which is Guard's to decide, so B is not proposed.

The Owner selected A in the review of this PLAN. The Guard Change belongs to the Guard thread. Engineering asks for it and writes nothing in `packages/kaal-guard/`.

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
| A Defect the Limitations define appears in the register only as `(product)`, and with no prohibited behaviour, Tested by or observation of its own | the six cited rows still carry "Traces to", "Gap" and "Status" |
| **Reverse direction.** A fixture register row that traces a Defect to a Test Case, by a "Traces to" cell or a Test Case named in its own cell, is refused, and so is a hand-written "Tested by" | the register traces Defect → Test Case today |
| **Invented status.** A fixture row carrying a status, such as "corrected", "established", "suspected" or a GREEN written as a lasting state, or a "Status" column, is refused | every register table has a "Status" column |
| **Duplicate authority.** A fixture register that defines a Defect the Limitations define, or defines one Defect twice, is refused, naming both places | the six cited rows still carry their own gap and status |

## Order

1. **Guard's Change** (option A) defines D6–D14 and D18 in the package and adds them to their Test Cases' titles.
2. **The engineering/C8 DO**, on `kaal/guard-release`, written RED first.
3. **Guard's 0.0.5 release sequence** names this DO's pull request as a required prerequisite, and its gate checks that the DO landed on `kaal/guard-release`.

Approving this PLAN authorizes the engineering/C8 DO only. It authorizes no synchronization, promotion or publication, and nothing in `packages/kaal-guard/`.
