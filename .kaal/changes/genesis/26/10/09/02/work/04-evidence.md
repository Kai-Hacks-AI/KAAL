# Evidence — the minimum 0.0.1 demonstration, with what exists today

Replay: `bash .kaal/changes/genesis/26/10/09/02/work/trial/run.sh <repo-root> <output-dir>`. It uses only the existing scripts (`kaal-review`, `kaal-sealing`, `kaal-incident`), reads the subject in `trial/subject/`, writes only into the output directory, and prints the transcript kept in `trial/transcript.txt`. The preserved record it produces is kept in `trial/out/`. No package, engineering, Core or `.github` file is touched.

## The scenario

A toy ledger. `requirements.md` (D2) and `architecture.md` (D3) are the agreed results; `scope.md` authorizes realizing the architecture, not revising it. The id rule agreed in D3 is "number of entries plus one", which contradicts R1 (ids are unique) once `retract` is used. The Code (D4) follows the architecture faithfully.

## The briefing's eight steps and the three cases

| # | Briefing | Shown |
|---|---|---|
| 1 | Agent develops against an agreed architecture | `ledger.v1.mjs` realizes `architecture.md`; the green suite passes (step 2) |
| 2 | Execution exposes a deviation | append, append, retract, append gives ids `[2,2]` (steps 3, 4) |
| 3 | Independent review confirms with a reproducible failing test | **scripted** round `review/01.md`; `ids-unique.red.mjs` fails with `R1 violated: ids [2,2]` |
| 4 | Valid, outside the authorized scope | `dispositions.md` F2; round 02 says it stands as a fact about the standard |
| 5 | Defect and red test preserved | `out/defects/01/`: `defect.md`, the red test byte for byte, `observed.txt`; still red when run from there (step 7) |
| 6 | Architecture unchanged | identity before and after identical (step 7) |
| 7 | Work continues, or HOW if blocked | continues: `ledger.v2.mjs`, round 02 `converged` on v2 and not on v1. The **blocked** branch is not run (see limits) |
| 8 | A later Change discovers it | step 9 finds `defects/01/defect.md` by `Disposition: later` and compares the recorded architecture identity with the one in force; it decides nothing |
| + | Valid in-scope finding corrected | F1: red on v1, green on v2 (steps 4, 5) |
| + | Invalid finding rejected, reasoning preserved | F3: the claimed failing test passes on the code, so the claim does not hold; `dispositions.md` F3 and round 02 |

## Transcript

```

== 1. Agreed results, by identity (no seal needed to cite them)
requirements.md  7cdadc4bb5309c1d28efb1ba558d96a0be764aeb16bdd5d6550cbbdccc523ac3
architecture.md  52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0

== 2. D4: the Worker realizes the architecture (v1) and the green suite passes
ledger.mjs v1  3e096e3215ea0b7ad55fc3f5ad4494c506b09669315dd6e5ffdbc3161d24f152
$ node tests/ledger.test.mjs
ledger.test: ok
(exit 0)

== 3. D5/D6: independent examination of the Code against the agreed Architecture and Requirements (round 01, findings)
<repo>/.kaal/changes/genesis/26/10/09/02/work/trial/out/review/01.md
(check exit 0)

== 4. The Worker investigates each finding; it does not take them as orders
-- F1 against v1
   AssertionError [ERR_ASSERTION]: Missing expected exception (TypeError).
   (exit 1)
-- F2 against v1
   AssertionError [ERR_ASSERTION]: R1 violated: ids [2,2]
   (exit 1)
-- F3 against v1
   AssertionError [ERR_ASSERTION]: Missing expected exception.
   (exit 1)

== 5. Dispositions: F1 valid and in scope (now); F2 valid, outside scope (later); F3 invalid (rejected)
ledger.mjs v2  bfeb6fc9d45ab96115ccb4b7615c289afbfa7e2a59d614960acda2a85a4f04fe
-- F1 against v2
   $ node append-rejects-nonobject.mjs
   F1: R4 holds
   (exit 0)
-- green suite against v2
   $ node tests/ledger.test.mjs
   ledger.test: ok
   (exit 0)
-- F2 against v2 (the red test stays red; the code is faithful to the architecture)
   AssertionError [ERR_ASSERTION]: R1 violated: ids [2,2]
   (exit 1)

== 6. Round 02: the Reviewer examines the Code as it now stands against its standard, and says whether each earlier finding stands
<repo>/.kaal/changes/genesis/26/10/09/02/work/trial/out/review/02.md
(converged on v2: exit 0)
02.md converged on Code bfeb6fc9d45ab96115ccb4b7615c289afbfa7e2a59d614960acda2a85a4f04fe, not on 3e096e3215ea0b7ad55fc3f5ad4494c506b09669315dd6e5ffdbc3161d24f152
(converged on v1: exit 1 , expected 1)

== 7. Preservation: the confirmed Defect and its red test, beside the agreed architecture and not in it
architecture.md still 52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0  (recorded 52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0)
unchanged: yes
defects/01 identity (named, domain defect): c41303c2de1432c3a5ce835f589c9fc615e23c05da82a3a718dfb007af6717f5
-- red test preserved byte for byte:
identical
-- still red when run from the preserved copy, with the Code beside it:
AssertionError [ERR_ASSERTION]: R1 violated: ids [2,2]
(exit 1)

== 8. Could an Incident carrier hold this Defect? (kaal-incident: addressed to KAAL, two parts)
   $ node <repo>/packages/kaal-incident/skills/kaal-incident/scripts/incident.mjs write <repo>/.kaal/changes/genesis/26/10/09/02/work/trial/out/kaal-dir --date 2026-10-09 --happened A ledger built to the agreed architecture gave two entries one id after a retract. --expected Ids stay unique for the life of the ledger (R1).
   incidents/26/10/09/01.md
   (exit 0)
   (the carrier has no place for the red test, the affected identities or a validity judgment; and kaal-incident says it is not for the client's own defects)

== 9. A later governed Change finds the Defect by reading closed Changes, and decides
defects/01/defect.md
-- is the architecture it was found against still the one in force? (it compares identities; it decides nothing)
recorded  52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0
in force  52b0f6f31827d9cf2cdce29ba84acdfb4a0f12e5b8482978b6adb189e67ee8c0

== 10. Cleanup of scratch (the preserved record is review/, dispositions.md, defects/)
  defects/01/defect.md
  defects/01/ids-unique.red.mjs
  defects/01/observed.txt
  dispositions.md
  review/01.md
  review/02.md
```

## Limits, honestly

- **The Reviewer is scripted.** Both rounds say so in their own Reviewer part. They exercise the form and the Worker's handling; they are not independent review and prove nothing about independence. This Change's own Reviewer seat is the Owner's to assign.
- **The blocked/HOW branch is argued (`03-architecture.md` §6.3), not run.** The loop that would raise it is #75, not merged; I did not build a stand-in.
- **A toy subject**, chosen so the defect is in the standard and not in the code. A real D3 defect will be messier; the second trial should use a real one.
- **Discovery is plain reading** (`grep` for a convention). That is the gap G5, not a solution.
- **Incident does not fit** (step 8): the carrier is accepted by `incident.mjs`, and cannot carry the red test, the identities or the validity judgment; its Node also says it is not for the client's own defects.
- **`defect.md` is a convention of this trial**, not a form any script checks. Whether it deserves a checker is Fork 3 and G2.
- The Work is open and unsealed; nothing here is closed.
