# C92 change

## PLAN

1. Add the drafts in `interface.md` (the Intent, the Requirement, the Architecture, `verdict.mjs` and `gatherEvidence`) and the Cases T1139 to T1148, all RED, next to the elements they test.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no workflow, nothing under `.github`, no variable and no setting.

## The rule of readiness (the Owner's, 18 Nov 2026)

A collector runs PDCA. It can act only when everything but the evidence of ACT is GREEN. It is done only when ACT is GREEN too, and an ACT before everything else is GREEN is not allowed. The verdict is built on this rule: a RED Case means not ready; an `act.md` while a Case is RED is reported as `act-before-green`; every Change with its ACT and no RED Case means ready (`raisable`).

## How it maps to controls (proposal, nothing is decided)

- **The verdict is detective.** It reports; it is the output of the Dispatcher's decision (release/I51, release/F69) and it changes no ruleset. This Change adds no control (release/CTL21 stays free).
- **Blocking an ACT before the rest is GREEN would be preventive**: a gate on the pull request that adds `act.md` (the `act` phase of the ratchet: RED 0, UNKNOWN 0). It is not part of this Change, not designed here and not enforced anywhere. It needs an explicit Owner decision first; that is a separate question to the Owner. Until then the verdict reports `act-before-green`, so a violation is visible without the gate.

## Scope: readiness from the ratchet is its own Change

This Change does only the part of readiness that needs no execution. From the files that differ from `main`, read as Git data from the base with nothing of the collector run, it counts the Cases still named `.red.mjs` and the Change folders that hold an `act.md`. That count stands in for RED and GREEN. The true counts come from the runner of Testing through the ratchet of kaal-change, which is not on `main`. So:

- **In this Change:** the shape of the verdict, the seat as a separate line, the facts, the order, and file-evidence readiness behind one function (`readiness`) whose counts have the shape `{red, green, unknown}`.
- **A Change of its own, id to be allocated, not widened into this one:** replacing the file count by the ratchet's counts once release/C12 is on `main`; and the preventive gate on ACT, if the Owner decides one.

## Mechanism

- `decide Dispatch` runs from `main` with the read token only. The collector is read through GET requests as data. A list of 300 or more changed files is incomplete and gives UNKNOWN. UNKNOWN never passes.
- `raisable` means only that the collector qualifies. `seat` is `free`, `taken` or `n/a` on its own line. Only a `raisable` collector with a free seat keeps `action: raise`, so `raise.mjs` and `dispatcher.yml` are unchanged and the raise stays off.
- The title and body of a PROMOTION are derived from the Change folders, not from the title of a pull request.
- An earlier closed PROMOTION is shown as a fact (number, `closed` or `merged`); it suppresses nothing and nothing is called parked.
- The order is by collector name, labelled `collector name (not a priority)`; the real priority is release/C75.

## Ids

Change `release/C92`, Intent `release/I51`, Requirement `release/F69`, Architecture `release/A64`, Cases T1139 to T1148, allocated 18 Nov 2026. No Gap id, no control. Next free: T1149, I52, F70, A65, C93, CTL21.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector `kaal/release/dispatcher-verdict`: add `I51.md`, `F69.md`, `A64.md`, `verdict.mjs`, `gatherEvidence` in `gather.mjs`, and use them in `dispatch.mjs decide`; rename T1139 to T1148 from `.red.mjs` to `.test.mjs` when green; amend the Cases of release/C72 and release/C73 that fix the old skip reasons (each named in the pull request, none skipped).

## ACT

A 4L retrospective in `act.md`. T1139 to T1148 are element Cases and stay beside their elements; this Change holds no change-semantic Case.
