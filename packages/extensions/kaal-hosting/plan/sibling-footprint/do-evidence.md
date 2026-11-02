# Sibling-footprint documentation and Skill delivery

Date: 2026-11-02. Proposed hosting/C30 DO of the Owner-approved #832 semantic
PLAN. Base `ec5ce9f88f1ccd5bea3c68b78f8eb7e832c5b93d`, the accepted #830
Hosting collector. C27 #831 and the C28 PLAN integration remain independent.
This candidate must refresh after their actual integration; it does not carry
their unintegrated implementation or imply approval of the refreshed DO.

## What changes

F5's final sentence is replaced with the exact approved clarification. Its link
refusals, path constraints and error codes remain unchanged. Architecture and
Limitations distinguish caller-designated root changes from the documented
canonical-root lock/staging/aside siblings. The Skill requires authority for that
complete footprint before a writer operation, holds a strictly root-only task,
and retains recovery originals/leftovers pending separate authority. The existing
runtime, Extension Node, exports, dependencies, executable examples and version
are unchanged. There is no runtime permission inference or enforcement API.

## Mechanical characterization and evidence

T88/T89 were frozen in local commit `60784bd` before editing authoritative docs
or guidance. Test-file Foundation SHA-256:
`856dcf44c7240107ab102fa1ccd320b1a75a9975da219d687cfac774d2c69915`.
They pass on the accepted runtime both before and after the prose change.
No behavioral RED is claimed for an amendment that changes no runtime behavior.

- T88 exercises real escaping-path refusal and snapshots root and sibling entry
  kinds/bytes before/after. All attempted paths preserve them exactly.
- T89 observes the real graceful-fs calls while the real reconciliation executes;
  the observers forward calls to the actual host and replace no verdict. It
  observes sibling lock/staging/aside machinery, checks the complete observed
  writer-location set, unchanged unrelated bytes and absence of machinery after
  successful cleanup. The test caller owns its entire isolated temporary parent.
- T88/T89 and unchanged relocated Skill T71 pass 3/3, zero skips/todos. The test
  bytes remain unchanged after the amendment. Existing T12/T13/T16 pass 3/3 and
  retain failed rollback/recovery originals, leftovers and held-rollback semantics.
- Existing four shipped-example mutation challenges are assertion-killed. Example
  code blocks are unchanged; the operations resource's prose/hash changes are
  legitimate shipped content, inventoried by normal prepack.
- A2 moves from unverified-by-any-Case to explicitly publisher-allocated T89.
  This does not claim installed coverage or prove the caller's authority. The
  consumer's delivered case inventory and all existing assertions remain intact.
- Full local source first group: 144/146, existing T43/T66 fail because this
  sandbox cannot create the Unix socket required by the Linux host guide. No
  skips/todos. The later chained groups are not claimed executed by that command.
- Normal prepack with pinned npm 11.21.0 was attempted and refuses at that host
  prerequisite. No local normal packed artifact or installed-product GREEN is
  claimed. Current-head three-host source, normal prepack, consumer/negative and
  all required checks remain mandatory.

The unchanged admitted C16 helper reconstructs the complete lock twice offline
from this immutable base and every candidate workspace/local manifest. The source
package command adds only this publisher file; no dependency or lock change is
selected. Verdict: passed; base, proposed and twice-derived lock SHA-256 all equal `65b91b53e84641af2252d5c304074cc72c63254c86376f5e9b2face1d3f55424`. Keep independent reconstruction separate from source test outcomes.

## Independent guidance validation remains explicit

The task cards in validation.md are prepared inputs and review obligations, not
an executed independent agent transcript. No second agent has been run here and
no semantic-validation GREEN is claimed. The Owner's PLAN approval establishes
the intended meaning; independent review/validation of this exact delivered Skill
must still distinguish insufficient root-only authority, sufficient footprint
authority and each unsafe recovery/containment recommendation. A regex or the two
filesystem probes is not a substitute. Earlier #812 guidance evidence is historical
and is not reused as current-artifact agent validation.

C27's separate T81 must qualify aside-allocation cleanup on the final combined
candidate; this documentation Change neither duplicates nor weakens that test.
No merge, SYNC, promotion, queue override, required-check waiver or publication is
performed. Independent DO review remains separate from #832's PLAN approval.

## Executed independent guidance trial, 2026-11-02

The previously unexecuted task cards above have now been evaluated by a separate
agent that read only the candidate Skill/resources and ordinary task inputs,
without reading the evaluator cards. The actual transcript is preserved in
`agent-validation.md`; `agent-artifacts.json` retains the final filesystem bytes
and inventories. Both tasks and four separately presented unsafe-advice challenges
were evaluated against the exact Skill from candidate
`b77a0b4e5edb6dbf6ff419952ad029829b3fccb9`.

Task A held the root-only write before mutation and checked unchanged NUL-bearing
sentinels and inventories. Task B used the exact relocated reconcile example,
the installed scoped public identity, the caller's original digest and explicit
root-plus-machinery authority. It reported notes.md written, read back the exact
requested bytes, preserved unrelated bytes/inventories and reported no leftovers.
The agent rejected implicit staging authority, an arbitrary sibling destination,
deletion of UNRESTORED originals, and unconditional immutability/physical/crash
promises. These are recorded judgments, not runtime permission enforcement.

The consumer was diagnostic: exact candidate product files plus a normal tsc
build and integrity-checked locally cached dependencies. It was not a normal
packed artifact or installed-verifier acceptance. Normal local prepack with npm
11.21.0 was attempted and failed closed at the existing T66 Linux socket guide
prerequisite. Native exact-head CI on b77a0b4 independently passed 146 source and
15 normal packed/installed cases on each of Linux, macOS and Windows; those
historical runs do not qualify a subsequent combined release candidate.

Fresh local unchanged T71/T88/T89 pass 3/3; T12/T13/T16 pass 3/3; four usage
mutations are assertion-killed. Initial local hydration's extra terminal newline
was corrected and all 76 files verified against exact Git blob identities before
the final relocated trial. The transcript records this correction and a trial
harness comparison error that occurred before any writer call. No failed setup
is counted as behavior evidence. The evidence-only amendment changes no product,
Skill, runtime, example, test, manifest or dependency bytes. Independent DO/Owner
approval, required CI, refresh after #831/#832 and combined C27 T81 assurance remain
open; the semantic trial is not approval or integration authority.
