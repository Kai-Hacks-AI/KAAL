# FAR authorization and PLAN/DO integrity (PLAN)

PLAN, nothing is built or changed by this Change. It answers the CPO decision of 9 Nov (FAR authorization and PLAN/DO integrity), which rests on the CTO's assessment of Change, Release and Guard ownership. It must be resolved before the FAR-based gates (F18, T9) are activated; it does not block other Release management work.

## Finding

F18 makes FAR (Regression, Features, Accepts) the content of test Candidate and test Integration, but three properties are assumed and not required or judged:

1. **Authorization comes before reliance.** `far.json` travels with the candidate, so the only barrier to a new Accept is the ordinary approval of the same pull request that relies on it.
2. **A DO cannot rewrite its acceptance criteria.** "Planned tests are immutable to DO and CHECK" is stated in Change's own testing document, with no control or Case behind it.
3. **An Accept has no lifecycle.** It has a reason and a decision, but no end condition, no outstanding count and no ratchet.

4. **The contract as written cannot be satisfied by a PLAN-authorized Accept.** Change's change/F7, F10 and T15 bind an Accept to the source revision and the target's baseline revision. A PLAN lands before the DO exists, so it cannot name the DO's revision, and every push or advance of the target voids the Accept. That is why `far.json` ends up travelling with the candidate. Nothing in Change's Intent or Requirements argues for it: it follows from change/A6, which keeps the record in the Change's own files. The fix is Change's, as Solution: an Accept is keyed to the Change and to the identities of the Cases it excepts, not to a revision.

It is a design gap, not only a documentation gap. The invariant to establish:

> **A DO may consume only Accepts authorized by an accepted PLAN.**

## Ownership (accepted by the CPO)

| Capability | Owns | Does not own |
| --- | --- | --- |
| **Change** | the authorization and lifecycle of Accepts: the record (reason, alternative, decision, authority, end condition), the PLAN/DO integrity rule, the exceptions logic (`exceptions`, `compose`) | where a gate runs or what a release does next |
| **Release** (Release management, in KAAL; Delivery) | whether progression is permitted against the authorized FAR contract: the gate reads the authorized contract, applies it, reports it, and fails closed | defining Accepts, deciding one, or restating Change's rules |
| **Guard** | that the evidence and the protective checks cannot be silently manipulated: the checker and the Regression are the target's copy (pinning, F17), and a missing verification never passes | interpreting FAR or authorizing an Accept |

KAAL-specific enforcement stays in Delivery (this folder). Change's Requirements and Cases are proposed to the Change thread; this PLAN does not edit Change's documents.

## The trusted baseline per integration boundary

The invariant does not say "read `main`". An accepted PLAN lands on the collector before the promotion, so `main` has not seen it. **The trusted baseline is the commit where the PLAN landed**, an ancestor of the candidate on the lineage and not necessarily the target's tip. The authorization of an Accept is that landing, approved with the designated authority's decision. The gate asks of each Accept: **which PLAN Change introduced it, and has that Change landed in the candidate's history with the authority's decision?** It compares the candidate's `far.json` and planned Cases with the PLAN's landing commit.

**How an Accept is keyed (proposed to Change, as Solution; replaces the revision binding of change/F7, F10 and T15):** an Accept names the Change (the DO's identity) and the identities of the Cases it excepts, with each Case's content digest. A Regression Case that changed since is a finding. Its scope stays one Change into one boundary, closed by its end condition, so "no standing waiver" still holds.

| Boundary | Gate | Baseline of authorized Accepts |
| --- | --- | --- |
| Pull request into a collector | test Integration (F16) | the collector's tip before the pull request: an Accept present there was landed by an earlier Change. A new or changed Accept in the pull request is authorized only if the pull request is itself a PLAN Change decided by the designated authority; a DO pull request may add none |
| Promotion of a collector into `main` | test Candidate (F12) | the history of the candidate: every Accept names the PLAN Change that introduced it, that Change is in the candidate's first-parent history, and the entry is unchanged since its landing. `main`'s tip alone is not the baseline, because the PLAN is not on `main` yet |

Open for the Owner (recorded in `gaps.md` as G13 when the Change lands): whether the designated authority's decision is read from the entry (`by`, `evidence`) and compared with the repository's designation, or from the approving review of the landing Change. The first is checkable by the gate; the second depends on a Review capability that is not built (change/A7).

## The five concerns, traced

| Concern | Required outcome | Requirement (proposed; id assigned by its owner) | Authoritative capability | Case (proposed; numbered in the RED) | Delivery realization |
| --- | --- | --- | --- | --- | --- |
| **Authorization** | a DO uses only PLAN-authorized Accepts | an Accept is authorized by the landing of a PLAN Change decided by the designated authority; a DO relies only on such Accepts | Change (the rule); Release (the gate checks it) | a candidate with an Accept absent from the PLAN's landing commit fails; one whose excepted Case changed since (digest) fails; one traced to a landed PLAN passes; one traced to a PLAN not in the history fails | F18 reads Accepts from the baseline above, not from the candidate alone |
| **Integrity** | a DO cannot silently change PLAN-established Cases or Accepts | the Cases and Accepts a PLAN established are immutable to its DO; a correction is a Defect or Change that drives a new PLAN | Change (the rule) | a DO that edits, removes or skips a planned Case, or edits an Accept, fails; a new PLAN that does so passes | the gate compares the planned set at the PLAN's landing with the candidate |
| **Lifecycle** | every Accept is traceable, visible and has a closure condition | an Accept names its reason, its authority and an end condition a Case can judge; the outstanding count and each end condition are reported; an expired Accept is a finding; the count may not grow without a PLAN decision (a ratchet against unauthorized growth; it need not fall in every DO) | Change (the record and the rule); Release (the report) | an Accept without an end condition is refused; an expired one fails; a count above the authorized baseline fails; a count at or below passes | the job summary lists each Accept with its end condition and the count against the baseline |
| **Progression** | gates fail closed when authorization cannot be established | no Accept applies, and the gate has no passing outcome, when `far.json` cannot be read, an entry cannot be traced, or the authority cannot be checked | Release | a fixture for each of the three: the gate fails and says which and what to do | the fail-closed rule of the testing controls (`testing-controls-plan.md`): no outcome is not a pass |
| **Ownership** | no duplicate authorization or evaluation logic across Change, Release and Guard | one authority per judgment (the table above); F18 references change/F8 to F11 and restates none of them | all three | the interim lane carries the Cases of change/T9 to T16 as its own, so the later swap proves equivalence | the interim stays interim (`interim-states.md`) and is not the authority |

## The CTO's open questions, answered from the documents

- **Q4, is `far.json` read from the candidate or from `main`?** Neither is specified: F18 says the runner reads `far.json` and runs `main`'s Regression against the candidate, without saying whose copy. This PLAN fixes it: the baseline per boundary above.
- **Q5, is an Accept re-decided at each border?** Yes, by F18's own wording: an Accept applies only to the integration it names and never transfers, and on promotion the entries are consumed. The count of decisions grows with the stations; the outstanding count above is what totals them.
- **Q6, does anything enforce that a DO does not edit planned tests?** No. The Integrity row is the Case for it.

## Sequence

1. This PLAN, CPO review, merge into the collector. A landed PLAN is a go for steps 2 to 4; none of them activates a gate.
2. **Change thread:** the Change-side requirements and Cases (authorization; keying an Accept to the Change and Case identities instead of revisions, which means revising change/F7, F10 and T15; integrity; end condition; Skill guidance), in the Change capability's own Change. Release management proposes them and does not edit Change's documents.
3. **Release management, RED then DO:** the F18 clauses (baseline per boundary, the report, fail closed) and their Cases, with the interim reading `far.json` carrying change/T9 to T16. Documents and `lanes/` only.
4. **Documentation correction:** F18 references change/F8 to F11 instead of restating Features-never-excepted and the stale-entry rule.
5. The FAR-based gates (`gate (integration)`, `gate (promotion)`) are activated only after steps 2 and 3 are done and the Owner has decided the open question above.

## Not in this Change

Any code, any change to Change's, Guard's or Release's documents, activation of a gate or ruleset, `kaal-change/far` itself, the Review capability that would define authorization evidence, and promotion into `main`.
