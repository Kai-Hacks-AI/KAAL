# Foundation 0.0.2: the Boundary Check (PLAN, re-cut into the final layout)

Capability owner: Foundation. Logical Change foundation/C13 (PLAN) re-cut for the final package layout; its DO is
foundation/C14. Numbers are provisional until the collector integrates them. It replaces #747, which planned a
different design (`check` and `boundary` commands) in the flat layout.

PLAN. The Owner decided on 2026-11-09 that Foundation 0.0.2 ships its Boundary Check, because Foundation is becoming
the reference package and must do better than Hosting 0.0.1, whose Boundary Check is declared "not applicable".

The Owner's design rulings of 2026-11-09, which this PLAN follows:
- A boundary test finds what the package should own being done elsewhere, and points at files and folders.
- A boundary test never carries its targets (they are input) and a package never names a role.
- A finding is audit, which belongs to Engineering. Only a consequence of a decision (a Defect, a Requirement, or a
  change to Intent or Architecture) enters the package, through a Change.
- On a promotion the incoming package's boundary test challenges the existing packages and the repository, and the
  existing packages' tests challenge it. The package proof point only runs those checks and collects the findings.

What the PLAN delivers (DO to follow after review):
- `04-test/boundary-check/scan.mjs --target <path>…`: Foundation's own scan, in Hosting's output shape. Three rules:
  `copy`, `implementation`, `crypto` (foundation/F22–F24).
- `04-test/boundary-check/boundary-check.md`: the record, Applicable, with command, rules, axes and limits (foundation/F25).
- Cases T37–T45 (RED, `04-test/engineering-check/plan/boundary.test.mjs`) and delivered Case T46.
- Dropped from the first head of this PLAN: the `check` and `boundary <consumer>` commands and the Hosting-scan
  evidence of Foundation (Hosting's check, run by whoever promotes Foundation).

All nine planned Cases are RED, because the scan, the record and the documents are not delivered. This is
missing-deliverable evidence.

No promotion, version bump on main, SYNC or npm publication is authorized by this record.
